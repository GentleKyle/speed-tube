"use strict";
const self = document.currentScript;
const defaultsString = self.dataset.defaults;
const defaults = JSON.parse(defaultsString);

let currentVideo = null; //so we can set default on new
let ytPlayer = null;
let timerId = null;
let lastSpeed = defaults.playbackRate;
let settingsObserver = null;

function main() {

console.log("main");
    overrideMediaMethod("play"); 
    overrideMediaMethod("pause"); 
    //overrideMediaMethod("load"); //caused issue certain cases - seems fine without     

    //setupUrlObserver();

    window.addEventListener("keyup", (event) => {
        if (!ytPlayer || !ytPlayer.isConnected) {
            console.log("escaped event listener cus no ytPlayer");
            return;
        }
console.log(event);
        const isPressed = (modifier) => event[modifier];
        let currentSpeed = ytPlayer.getPlaybackRate();
        console.log("currentSpeed:", currentSpeed);
        if (defaults.keybinds.speedUp.modifiers.every(isPressed)) {
            if (event.key === defaults.keybinds.speedUp.key) {
                setSpeed(currentSpeed + .25);
            }
        }
        if (defaults.keybinds.speedDown.modifiers.every(isPressed)) {
            if (event.key === defaults.keybinds.speedDown.key) {
                setSpeed(currentSpeed - .25);
            }
        }
    })
}
//ensure that label matches slider value
function setSpeed(newSpeed) {
    console.log("newSpeed, lastSpeed", newSpeed, lastSpeed);
    if (newSpeed > defaults.maxPBR) {
        newSpeed = defaults.maxPBR;
    }
    if (newSpeed < .25) {
        newSpeed = .25;
    }

    ytPlayer.setPlaybackRate(newSpeed);
    lastSpeed = newSpeed;
    displaySpeed(newSpeed);

    // const customMenuItem = ytPlayer.querySelector(".ytp-menuitem-with-footer");
    // if (customMenuItem && customMenuItem.getAttribute('aria-checked') === "true") {
    //     const slider = customMenuItem.querySelector(".ytp-speedslider");
    //     const itemLabel = customMenuItem.querySelector(".ytp-menuitem-label");
    //     const sliderLabel = customMenuItem.querySelector(".ytp-speedslider-text");

    //     // slider.value = newSpeed;
    //     // sliderLabel.textContent = newSpeed.toFixed(2);
    //     // itemLabel.textContent = `Custom (${newSpeed.toFixed(2)})`;

    //     slider.dispatchEvent(new Event("input", {bubbles: true}));
        
    // }
 //1.2
 // .25 - 1.2 = .95
 // 1 - 1.2 = .2
 // 1.25 - 1.2 = .05
 // 1.25 .12  .13 .12
    
    
}

function overrideMediaMethod(method) {
    const ogMethod = HTMLMediaElement.prototype[method];

    //could add args here but ones we use now do not need
    HTMLMediaElement.prototype[method] = function() {
        const ogReturn = ogMethod.apply(this);

        handleMediaOverride(this, method);

        return ogReturn;
    }
    console.log("override ", method);
}
//
function handleMediaOverride(video, method) {
    console.log("entry method:", method);

    if (ytPlayer !== video.parentElement.parentElement) {
        if (settingsObserver) {
            settingsObserver.disconnect();
            console.log("observer disconnected");
        }

        ytPlayer = video.parentElement.parentElement; 
        console.log("set ytPlayer to:", ytPlayer,);

        setupSettingsMenuObserver();
    }

    if (!ytPlayer.getAvailablePlaybackRates().includes(defaults.maxPBR)) {
        for (let i = 2.25; i <= defaults.maxPBR; i += .25) {
            console.log(i, method);
            ytPlayer.getAvailablePlaybackRates().push(i);
        }
    }

    ytPlayer.addEventListener("onStateChange", (state) => {
        console.log("state:", state);
        //playing
        if (state === 1 || state === -1) {
            const newVideo = ytPlayer.getVideoData().video_id;
            if (currentVideo !== newVideo) {
                console.log("state change - new vid - set defaults");
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
     console.log("(no exist)appended to: ", ytPlayer);   
    }
    else { //make sure it is in the right spot
        const myDiv = document.getElementById("my_pbr_display");
        if (!Array.from(ytPlayer.children).includes(myDiv)) {
            ytPlayer.appendChild(myDiv);
            console.log("(moved)appended to: ", ytPlayer); 
        }
    }
    
    const speedDiv = document.getElementById("my_pbr_display");
    speedDiv.textContent = `${speed}x`;
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

function setupSettingsMenuObserver() {
    const settingsMenu = ytPlayer.querySelector("#ytp-id-18");
    console.log("observer setup, settingsMenu:", settingsMenu);

    const observer = new MutationObserver((mutations) => {
        console.log("mutations:", mutations);
        const menuItems = settingsMenu.querySelectorAll(".ytp-menuitem");

        menuItems.forEach((item) => {
            if (!item.hasMyOnClick) {
                item.hasMyOnClick = true;
                item.addEventListener("click", () => {
                    console.log("this was clicked:", item);
                    lastSpeed = ytPlayer.getPlaybackRate();
                });
            }
        });
    });
//SEEMS TO WORK - TEST REMOVING STUFF THAT MAYBE i DO NOT NEED !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    observer.observe(settingsMenu, {childList: true});
    settingsObserver = observer;
}

// function onYtPlayerReady(callback) {
//     const maxTries = 22;
//     let tryNum = 0;
// console.log("in player ready");
//     const intervalId = setInterval(() => {
//         tryNum++;
        
//         const ytPlayer = currentVideo.parentElement.parentElement;

//         if (ytPlayer && typeof ytPlayer.getPlaybackRate === "function" && typeof ytPlayer.getPlaybackRate() === "number") {
//             clearInterval(intervalId);
//             callback(ytPlayer);
//         }
//         else {
//             if (tryNum >= maxTries) {
//                 clearInterval(intervalId);
//                 console.error("Reached max tries waiting for YouTube player API to load.");
//             }
//         }
//     }, 500);
// }

main();