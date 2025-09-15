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
    lastSpeed: defaults.playbackRate, //do not think I need this anymore
    settingsObserver: null,
    currentVideoId: null,
    timerId: null,
//does this get weird if there is more than one video? Like main vid playing then hover for preview and we lose main vid
    init(videoElement) { 
        this.video = videoElement;

        if (this.ytPlayer !== videoElement.parentElement.parentElement) {
            this.ytPlayer = videoElement.parentElement.parentElement;

            this.ytPlayer.addEventListener("onStateChange", (state) => {
                //playing/unstarted
                if (state === 1 || state === -1) {
                    const newVideoId = this.ytPlayer.getVideoData().video_id;
                    if (this.currentVideoId !== newVideoId) {
                        this.setSpeedTo(defaults.playbackRate);
                        this.lastSpeed = defaults.playbackRate;
                        this.currentVideoId = newVideoId;
                    }
                    else {
                        //only need this for an ad? speed applied to ad then video is 1x?
                        //this.setSpeedTo(this.lastSpeed);
                    }
                    }
            //other states
            // -1(unstarted) 0(ended) 1(playing) 2(paused) 3(buffering) 
            // 5(video cued - loaded but not playing)
            });

            this.setupSettingsMenuObserver();
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
        if (this.timerId) {
            clearTimeout(this.timerId);
            this.timerId = setTimeout(() => {
                speedDiv.classList.add("my_fadeout");
                this.timerId = null;
            }, 750);            
        }
        // no current timer then set one
        else {
            this.timerId = setTimeout(() => {
                speedDiv.classList.add("my_fadeout");
                this.timerId = null;
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

        this.video.playbackRate = newSpeed;
        //lastSpeed = newSpeed;
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

    setupSettingsMenuObserver() {
        if (this.settingsObserver) {
            this.settingsObserver.disconnect();
        }

        const settingsMenu = this.ytPlayer.querySelector("#ytp-id-18");

        const observer = new MutationObserver(() => {
            const menuItems = settingsMenu.querySelectorAll(".ytp-menuitem");

            menuItems.forEach((item) => {
                if (!item.hasMyOnClick) {
                    item.hasMyOnClick = true;
                    item.addEventListener("click", () => {
                        console.log("clicked: ", item);
                    });
                }
            });
        });

        observer.observe(settingsMenu, {childList: true});
        this.settingsObserver = observer;
    },

};