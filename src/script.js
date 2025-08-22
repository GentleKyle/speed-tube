"use strict";
const self = document.currentScript;
const defaultsString = self.dataset.defaults;
const defaults = JSON.parse(defaultsString);

let currentVideo = null; //so we can set default on new
let ytPlayer = null;
let timerId = null;
let lastSpeed = defaults.playbackRate;
let settingsObserver = null;

//if we want to try and add the slider back could try to clone it 
//clone(removes listeners from YT) - replace - attach my listeners - code behavior
//prolly quite brittle

//could add smaller increments with favorites at the top of the list
function main() {

    overrideMediaMethod("play"); 
    overrideMediaMethod("pause"); 
    //overrideMediaMethod("load"); //caused issue certain cases - seems fine without     

    window.addEventListener("keyup", (event) => {
        if (!ytPlayer || !ytPlayer.isConnected) {
            return;
        }

        const isPressed = (modifier) => event[modifier];
        let currentSpeed = ytPlayer.getPlaybackRate();

        if (defaults.keybinds.speedUp.modifiers.every(isPressed)) {
            if (event.key === defaults.keybinds.speedUp.key) {
                setSpeed(currentSpeed + defaults.incrementPBRVal);
            }
        }
        if (defaults.keybinds.speedDown.modifiers.every(isPressed)) {
            if (event.key === defaults.keybinds.speedDown.key) {
                setSpeed(currentSpeed - defaults.decrementPBRVal);
            }
        }
    })
}

function setSpeed(newSpeed) {

    if (newSpeed > defaults.maxPBR) {
        newSpeed = defaults.maxPBR;
    }
    if (newSpeed < .25) {
        newSpeed = .25;
    }

    ytPlayer.setPlaybackRate(newSpeed);
    lastSpeed = newSpeed;
    displaySpeed(newSpeed);
}

function overrideMediaMethod(method) {
    const ogMethod = HTMLMediaElement.prototype[method];

    //could add args here but ones we use now do not need
    HTMLMediaElement.prototype[method] = function() {
        const ogReturn = ogMethod.apply(this);

        handleMediaOverride(this);

        return ogReturn;
    }
}

function handleMediaOverride(video) {

    if (ytPlayer !== video.parentElement.parentElement) {
        if (settingsObserver) {
            settingsObserver.disconnect();
        }

        ytPlayer = video.parentElement.parentElement; 

        setupSettingsMenuObserver();
    }

    if (!ytPlayer.getAvailablePlaybackRates().includes(defaults.maxPBR)) {
        for (let i = 2.25; i <= defaults.maxPBR; i += .25) {
            ytPlayer.getAvailablePlaybackRates().push(i);
        }
    }

    ytPlayer.addEventListener("onStateChange", (state) => {
        //playing/unstarted
        if (state === 1 || state === -1) {
            const newVideo = ytPlayer.getVideoData().video_id;
            if (currentVideo !== newVideo) {
                ytPlayer.setPlaybackRate(defaults.playbackRate);
                lastSpeed = defaults.playbackRate;
                currentVideo = newVideo;
            }
            else {
                ytPlayer.setPlaybackRate(lastSpeed);
            }
        }
//other states
// -1(unstarted) 0(ended) 1(playing) 2(paused) 3(buffering) 
// 5(video cued - loaded but not playing)
    });
}

function displaySpeed(speed) {
    //create the div if no exist - first key press
    if (!document.getElementById("my_pbr_display")) {
        const newDiv = document.createElement('div');
        newDiv.id = "my_pbr_display";
        newDiv.addEventListener("animationend", () => {
            newDiv.classList.remove("my_fadeout");
            newDiv.style.opacity = 0;
        })

        ytPlayer.append(newDiv);
    }
    else { //make sure it is in the right spot
        const myDiv = document.getElementById("my_pbr_display");
        if (!Array.from(ytPlayer.children).includes(myDiv)) {
            ytPlayer.appendChild(myDiv);
        }
    }
    
    const speedDiv = document.getElementById("my_pbr_display");
    speedDiv.textContent = `${parseFloat(speed).toFixed(2)}x`;
    //for when keypress is during fadeout
    speedDiv.classList.remove("my_fadeout");
    speedDiv.style.opacity = 0.8;

    //if current timer then reset
    if (timerId) {
        clearTimeout(timerId);
        timerId = setTimeout(() => {
            speedDiv.classList.add("my_fadeout");
            timerId = null;
        }, 750);            
    }
    // no current timer then set one
    else {
        timerId = setTimeout(() => {
            speedDiv.classList.add("my_fadeout");
            timerId = null;
        }, 750);               
    }
}

//use default clicking behavior but I know what to set it back to on play/pause
function setupSettingsMenuObserver() {
    const settingsMenu = ytPlayer.querySelector("#ytp-id-18");

    const observer = new MutationObserver(() => {
        const menuItems = settingsMenu.querySelectorAll(".ytp-menuitem");

        menuItems.forEach((item) => {
            if (!item.hasMyOnClick) {
                item.hasMyOnClick = true;
                item.addEventListener("click", () => {
                    lastSpeed = ytPlayer.getPlaybackRate();
                });
            }
        });
    });

    observer.observe(settingsMenu, {childList: true});
    settingsObserver = observer;
}

main();