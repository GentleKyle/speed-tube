"use strict";
const self = document.currentScript;
const defaultsString = self.dataset.defaults;
const defaults = JSON.parse(defaultsString);

let currentVideo = null; //so we can set default on new
let ytPlayer = null;
let timerId = null;

function main() {

console.log("main");
    overrideMediaMethod("play"); 
    overrideMediaMethod("pause"); 
    //overrideMediaMethod("load"); //caused issue certain cases - seems fine without     

    window.addEventListener("keyup", (event) => {
        if (!ytPlayer || !ytPlayer.isConnected) {
            console.log("escaped event listener cus no ytPlayer");
            return;
        }
console.log(event);
        const isPressed = (modifier) => event[modifier];
//if you use custom slider then keybinds then it is off(2.8x, 2.55x, etc) - could change to select speed in array
        if (defaults.keybinds.speedUp.modifiers.every(isPressed)) {
            if (event.key === defaults.keybinds.speedUp.key) {
                const newPBR = ytPlayer.getPlaybackRate() + .25;
                if (newPBR <= defaults.maxPBR) {
                    ytPlayer.setPlaybackRate(newPBR);
                    displaySpeed(newPBR);
                }
            }
        }
        if (defaults.keybinds.speedDown.modifiers.every(isPressed)) {
            if (event.key === defaults.keybinds.speedDown.key) {
                const newPBR = ytPlayer.getPlaybackRate() - .25;
                if (newPBR >= .25) {
                    ytPlayer.setPlaybackRate(newPBR);
                    displaySpeed(newPBR);
                }
            }
        }
    })
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

function handleMediaOverride(video, method) {
    if (ytPlayer !== video.parentElement.parentElement) {
        ytPlayer = video.parentElement.parentElement;
        console.log("set ytPlayer to:", ytPlayer);
    }

    if (!ytPlayer.getAvailablePlaybackRates().includes(defaults.maxPBR)) {
        for (let i = 2.25; i <= defaults.maxPBR; i += .25) {
            console.log(i, method);
            ytPlayer.getAvailablePlaybackRates().push(i);
        }
    }
console.log("Is it a new video?");
    if (currentVideo !== ytPlayer.getVideoData().video_id) {
        console.log("Yes, setting default PBR");
        
        ytPlayer.setPlaybackRate(defaults.playbackRate);
        console.log("current PBR:", ytPlayer.getPlaybackRate());
        console.log("ytPlayer: ", ytPlayer);
        currentVideo = ytPlayer.getVideoData().video_id;
    }

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