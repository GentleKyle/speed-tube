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
    overrideMediaMethod("load"); //caused issue certain cases - seems fine without     

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
    speed: defaults.playbackRate, //do not think I need this anymore
    settingsObserver: null,
    currentVideoId: null,
    displayTimerId: null,
    observerTimerId: null,
    myPanel: null,
//does this get weird if there is more than one video? Like main vid playing then hover for preview and we lose main vid
    init(videoElement) { 
        this.video = videoElement;

        if (this.ytPlayer !== videoElement.parentElement.parentElement) {
            this.ytPlayer = videoElement.parentElement.parentElement;

            this.ytPlayer.addEventListener("onStateChange", (state) => {
                const newVideoId = this.ytPlayer.getVideoData().video_id;
                if (this.currentVideoId !== newVideoId) {
                    this.speed = defaults.playbackRate;
                    this.currentVideoId = newVideoId;
                    this.setupSettingsMenuObserver();
                }

                //playing
                if (state === 1) {
                    this.setSpeedTo(this.speed);
                }
            //other states
            // -1(unstarted) 0(ended) 1(playing) 2(paused) 3(buffering) 
            // 5(video cued - loaded but not playing)
            });

            //this.setupSettingsMenuObserver();
            this.updateYtMenuDisplay();
        }

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
        speedDiv.textContent = `${parseFloat(this.video.playbackRate).toFixed(2)}x`;
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

    setSpeedTo(newSpeed) {
        if (newSpeed > defaults.maxPBR) {
            newSpeed = defaults.maxPBR;
        }
        if (newSpeed < .25) {
            newSpeed = .25;
        }

        this.speed = newSpeed;
        this.video.playbackRate = newSpeed;
        this.updateYtMenuDisplay();
    },

    incrementSpeed() {
        if (!this.video) {
            return;
        }

        this.setSpeedTo(this.video.playbackRate + defaults.incrementPBRVal);
    },

    decrementSpeed() {
        if (!this.video) {
            return;
        }

        this.setSpeedTo(this.video.playbackRate - defaults.decrementPBRVal);
    },

    updateYtMenuDisplay() { 
        const settingsMenu = this.ytPlayer.querySelector("#ytp-id-18");
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

    },

    setupSettingsMenuObserver() {
        if (this.settingsObserver) {
            this.settingsObserver.disconnect();
        }

        
console.log("mutation"); //remove ytPlayer reference here and run this in main?????!!!!!!!!
        const settingsMenu = this.ytPlayer.querySelector("#ytp-id-18");

        const observer = new MutationObserver((list, obs) => {
            console.log("observe");
            
            obs.disconnect();
            if (this.myPanel) {
                //returns null if parent display: none
                if (!this.myPanel.offsetParent) {
                    this.myPanel.remove();
                }
            }
            this.updateYtMenuDisplay();
            obs.observe(settingsMenu, {childList: true, subtree: true});
//debouncing
            if (this.observerTimerId) {
                console.log("reset timer");
                clearTimeout(this.observerTimerId);
                this.observerTimerId = setTimeout(() => {
                    console.log("timer finished in if");
                    this._handleSettingsMenu(obs);//what if I just use youtubes stuff for .25 to 2 and then do my own thing above that !!!!!!
                    this.observerTimerId = null; //then just change the menu visually
                }, 50);            
            }
            else {
                console.log("start timer");
                this.observerTimerId = setTimeout(() => {
                    console.log("timer finished");
                    this._handleSettingsMenu(obs);
                    this.observerTimerId = null;
                }, 50);               
            }
        });

        observer.observe(settingsMenu, {childList: true, subtree: true});
        this.settingsObserver = observer;
    },

    _handleSettingsMenu(obs) { //make back button work - also always remove
        const settingsMenu = this.ytPlayer.querySelector("#ytp-id-18");
        const panelTitle = settingsMenu.querySelector(".ytp-panel-title");
        let panel;
        if (panelTitle) {
            panel = panelTitle.closest(".ytp-panel");
        }

        if (panel && panelTitle) {
            if (panelTitle.textContent.includes("Playback speed") && panel.querySelector(".ytp-menuitem")) {
                //console.log(this);
                obs.disconnect();
                this.myPanel = panel.cloneNode(true);
                panel.replaceWith(this.myPanel);
                const newMenuItems = this.myPanel.querySelectorAll(".ytp-menuitem");
                let currentSpeed = this.video ? this.video.playbackRate.toString() : defaults.playbackRate.toString();
                if (currentSpeed === "1") {
                    currentSpeed = "Normal";
                }
                console.log(newMenuItems);
                
                newMenuItems.forEach((item) => {
                    console.log(item);
                    if (item.textContent === currentSpeed) {
                        item.setAttribute("aria-checked", "true");
                    }
                    else {
                        item.setAttribute("aria-checked", "false");
                    }

                    item.addEventListener("click", () => {
                        console.log("clicked"); 
                        if (item.textContent.includes("Normal")) {
                            this.setSpeedTo(1);
                        }
                        else {
                            this.setSpeedTo(parseFloat(item.textContent));
                        }
                        this.myPanel.remove();
                    })
                })
                
                
            }
        }
        obs.observe(settingsMenu, {childList: true, subtree: true});
        
    },
};