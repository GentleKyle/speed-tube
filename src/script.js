"use strict";
const self = document.currentScript;
const defaultsString = self.dataset.defaults;
const defaults = JSON.parse(defaultsString);

//if we want to try and add the slider back could try to clone it 
//clone(removes listeners from YT) - replace - attach my listeners - code behavior
//prolly quite brittle

//could add smaller increments with favorites at the top of the list
//disable adjusting speed while typing in search bar

function main() {

    overrideMediaMethod("play"); 
    overrideMediaMethod("pause"); 
    //overrideMediaMethod("load"); //caused issue certain cases - seems fine without     

    window.addEventListener("keyup", (event) => {

        const isPressed = (modifier) => event[modifier];

        if (defaults.keybinds.speedUp.modifiers.every(isPressed)) {
            if (event.key === defaults.keybinds.speedUp.key) {
                bunnyPlayer.incrementSpeed();
                bunnyPlayer.displaySpeed();
            }
        }
        if (defaults.keybinds.speedDown.modifiers.every(isPressed)) {
            if (event.key === defaults.keybinds.speedDown.key) {
                bunnyPlayer.decrementSpeed();
                bunnyPlayer.displaySpeed();
            }
        }
    })
}

main();

function overrideMediaMethod(method) {
    const ogMethod = HTMLMediaElement.prototype[method];

    //could add args here but ones we use now do not need
    HTMLMediaElement.prototype[method] = function() {
        const ogReturn = ogMethod.apply(this);

        bunnyPlayer.init(this);

        return ogReturn;
    }
}

const bunnyPlayer = {
    ytPlayer: null,
    video: null,
    speed: defaults.playbackRate, 
    settingsObserver: null,
    currentVideoId: null,
    displayTimerId: null,
    observerTimerId: null,

    init(videoElement) { 
        let ytPlayer = document.getElementById("movie_player");
        if (videoElement) { 
            if (ytPlayer !== videoElement.parentElement.parentElement) {
                ytPlayer = videoElement.parentElement.parentElement;
            }
        }

        this.video = videoElement;

        if (this.ytPlayer !== ytPlayer) {
            this.ytPlayer = ytPlayer;

            this.ytPlayer.addEventListener("onStateChange", (state) => {
                const newVideoId = this.ytPlayer.getVideoData().video_id;
                if (this.currentVideoId !== newVideoId) {
                    //set default only if it is not the first video
                    //(it could not autoplay and user could manually change speed before playing)
                    if (this.currentVideoId !== null) {
                        this.speed = defaults.playbackRate;
                    }
                    this.currentVideoId = newVideoId;

                    this.setupSettingsMenuObserver(); 
                }

                //playing
                if (state === 1) {
                    this._setSpeedTo(this.speed);
                }
            //other states
            // -1(unstarted) 0(ended) 1(playing) 2(paused) 3(buffering) 
            // 5(video cued - loaded but not playing)
            });
        }

        this.setupSettingsMenuObserver();
    },

    setupSettingsMenuObserver() {
        if (this.ytPlayer.isSetup) {
            return;
        }
        this.ytPlayer.isSetup = true;

        if (this.settingsObserver) {
            this.settingsObserver.disconnect();
        }

        const settingsMenu = this.ytPlayer.querySelector("#ytp-id-18");

        const observer = new MutationObserver((list, obs) => {
            obs.disconnect();
            this._updateYtMenuDisplay();
            obs.observe(settingsMenu, {childList: true, subtree: true});

//debouncing - to wait for full render cycle
            if (this.observerTimerId) {
                clearTimeout(this.observerTimerId);
                this.observerTimerId = setTimeout(() => {
                    this._handleSpeedMenu(obs);
                    this.observerTimerId = null; 
                }, 50);            
            }
            else {
                this.observerTimerId = setTimeout(() => {
                    this._handleSpeedMenu(obs);
                    this.observerTimerId = null;
                }, 50);               
            }
        });

        observer.observe(settingsMenu, {childList: true, subtree: true});
        this.settingsObserver = observer;
    },

    displaySpeed() {
        //create the div if no exist - first key press
        if (!document.getElementById("my_pbr_display")) {
            const newDiv = document.createElement('div');
            newDiv.id = "my_pbr_display";
            newDiv.addEventListener("animationend", () => {
                newDiv.classList.remove("my_fadeout");
                newDiv.style.opacity = 0;
            })

            this.ytPlayer.append(newDiv);
        }
        else { //make sure it is in the right spot
            const myDiv = document.getElementById("my_pbr_display");
            if (!Array.from(this.ytPlayer.children).includes(myDiv)) {
                this.ytPlayer.appendChild(myDiv);
            }
        }
        
        const speedDiv = document.getElementById("my_pbr_display");
        speedDiv.textContent = `${parseFloat(this.speed).toFixed(2)}x`;
        //for when keypress is during fadeout
        speedDiv.classList.remove("my_fadeout");
        speedDiv.style.opacity = 0.8;

        //if current timer then reset
        if (this.displayTimerId) {
            clearTimeout(this.displayTimerId);
            this.displayTimerId = setTimeout(() => {
                speedDiv.classList.add("my_fadeout");
                this.displayTimerId = null;
            }, 750);            
        }
        // no current timer then set one
        else {
            this.displayTimerId = setTimeout(() => {
                speedDiv.classList.add("my_fadeout");
                this.displayTimerId = null;
            }, 750);               
        }
    },

    incrementSpeed() {
        this._setSpeedTo(this.speed + defaults.incrementPBRVal);
    },

    decrementSpeed() {
        this._setSpeedTo(this.speed - defaults.decrementPBRVal);
    },

    _setSpeedTo(newSpeed) {
        if (newSpeed > defaults.maxPBR) {
            newSpeed = defaults.maxPBR;
        }
        if (newSpeed < .25) {
            newSpeed = .25;
        }

        this.speed = newSpeed;

        if (this.video) {
            this.video.playbackRate = newSpeed;            
        }

        this._updateYtMenuDisplay();
    },

    _updateYtMenuDisplay() { 
        const settingsMenu = this.ytPlayer.querySelector("#ytp-id-18"); 

        //for short/preview
        if (!settingsMenu) {
            return;
        }

        const menuItems = settingsMenu.querySelectorAll(".ytp-menuitem"); 
        let speed = this.speed.toString();
        if (speed === "1") {
            speed = "Normal";
        }

        menuItems.forEach((item) => {
            if (item.querySelector(".ytp-menuitem-label").textContent.includes("Playback speed")) {
                item.querySelector(".ytp-menuitem-content").textContent = speed;
            }
        });

        this._setSpeedMenuCheckmark();

    },

    _handleSpeedMenu(obs) { 
        const settingsMenu = this.ytPlayer.querySelector("#ytp-id-18");
        const panelTitle = settingsMenu.querySelector(".ytp-panel-title");
        let panel;
        if (panelTitle) {
            panel = panelTitle.closest(".ytp-panel");
        }
        const backButton = settingsMenu.querySelector(".ytp-panel-back-button");
        

        if (panel && panelTitle) {
            if (panelTitle.textContent.includes("Playback speed") && panel.querySelector(".ytp-menuitem")) {
                const panelMenu = panel.querySelector(".ytp-panel-menu");
                let newMenuItems = panel.querySelectorAll(".ytp-menuitem");

                obs.disconnect();
                
                //default youtube speed is 9 items - we only add custom once
                if (newMenuItems.length < 10) {
                    newMenuItems.forEach((item) => {
                        let speed = item.textContent;
                        if (speed === "Normal") {
                            speed = "1";
                        }
                        item.addEventListener("click", () => {
                            this.speed = parseFloat(speed);
                        })
                    })

                    for (let i = 2.25; i <= defaults.maxPBR; i += .25) {
                        const clonedItem = newMenuItems[newMenuItems.length - 1].cloneNode(true);
                        clonedItem.querySelector(".ytp-menuitem-label").textContent = i.toString();

                        clonedItem.addEventListener("click", () => {
                            this._setSpeedTo(parseFloat(clonedItem.textContent));
                            if (backButton) {
                                backButton.click();
                            }
                            else {
                                panel.remove();
                            }
                        })

                        panelMenu.appendChild(clonedItem);
                    }       
                }

                this._setSpeedMenuCheckmark();
            }
            obs.observe(settingsMenu, {childList: true, subtree: true});
        }
        
        
    },

    _setSpeedMenuCheckmark() {
        const settingsMenu = this.ytPlayer.querySelector("#ytp-id-18");
        let panelTitle;
        let panel;
        let speedOptions;

        if (settingsMenu) {
            panelTitle = settingsMenu.querySelector(".ytp-panel-title");
        }
        else {
            return;
        }
        if (panelTitle) {
            if (panelTitle.textContent.includes("Playback speed")) {
                panel = panelTitle.closest(".ytp-panel");
            }
        }
        else {
            return;
        }
        if (panel) {
            speedOptions = panel.querySelectorAll(".ytp-menuitem");
        }
        else {
            return;
        }

        let currentSpeed = this.speed.toString();
        if (currentSpeed === "1") {
            currentSpeed = "Normal";
        }
        
        speedOptions.forEach((speedOption) => {
            //could change this to round to nearest? I wonder if adding new options between YT's matters to them
            if (speedOption.textContent === currentSpeed) {
                speedOption.setAttribute("aria-checked", "true");
            }
            else {
                speedOption.setAttribute("aria-checked", "false");
            }
        })
    },
};

