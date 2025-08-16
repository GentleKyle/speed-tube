"use strict";
// const self = document.currentScript;
// const defaultsString = self.dataset.defaults;
// const defaults = JSON.parse(defaultsString);

function main() {


console.log("main");
    overrideMediaMethod("play");
    overrideMediaMethod("pause");
    overrideMediaMethod("load");    
}

function overrideMediaMethod(method) {
    const ogMethod = HTMLMediaElement.prototype[method];
console.log("override ", method);
    //could add args here but ones we use now do not need
    HTMLMediaElement.prototype[method] = function() {
        const ogReturn = ogMethod.apply(this);

        edit(this);

        return ogReturn;
    }
}
function edit(video) {
    console.log(video);
    const ytPlayer = video.parentElement.parentElement;
    ytPlayer.setPlaybackRate(.5);
    console.log(ytPlayer.getPlaybackRate());
}

main();




















    // const DEFAULT_PLAYBACK_SPD = 2;

    // const handleLoad = () => {
    //     setTimeout(() => {
    //         const container = document.getElementById("player-container");
    //         const video = container.getElementsByTagName("video")[0];

    //         if (!video) {
    //             return;
    //         }

    //         //sets video default speed on first load
    //         video.playbackRate = DEFAULT_PLAYBACK_SPD;
    //     }, 500);
        
    // };
    
    // //first page load - you write/paste in a video url directly
    // window.addEventListener("load", handleLoad);
    // //every 1sec check if url has changed - link click
    // let currentUrl = location.href;
    // setInterval(() => {
    //     if (location.href !== currentUrl) {
    //         currentUrl = location.href;
    //         handleLoad();
    //     }
    // }, 1022);


    // window.addEventListener("keyup", (event) => {
    //     const container = document.getElementById("player-container");
    //     const video = container.getElementsByTagName("video")[0];

    //     if (!video) {
    //         return;
    //     }

    //     if (event.ctrlKey) {
    //         if (event.key === "ArrowUp") {
    //             incrementPBR(video);
    //         }
    //         if (event.key === "ArrowDown") {
    //             decrementPBR(video);
    //         }
    //     }
    // });


    // const incrementPBR = (video) => {
    //     const currentPBR = video.playbackRate;

    //     if (currentPBR < 6) {
    //         video.playbackRate = currentPBR + 0.25;
    //     }

    //     displaySpeed(video);
    // };

    // const decrementPBR = (video) => {
    //     const currentPBR = video.playbackRate;

    //     if (currentPBR > 0.25) {
    //         video.playbackRate = currentPBR - 0.25;
    //     }

    //     displaySpeed(video);
    // };

    // let timerId = null;
    // const displaySpeed = (video) => {
    //     const speed = video.playbackRate;
    //     //create the div if no exist - first key press
    //     if (!document.getElementById("my_pbr_display")) {

    //         const newDiv = document.createElement('div');
    //         newDiv.id = "my_pbr_display";
    //         newDiv.addEventListener("animationend", () => {
    //             newDiv.classList.remove("my_fadeout");
    //             newDiv.style.opacity = 0;
    //         })

    //         video.parentElement.parentElement.append(newDiv);
    //     }
        
    //     const speedDiv = document.getElementById("my_pbr_display");
    //     speedDiv.textContent = `${speed}x`;
    //     //for when keypress is during fadeout
    //     speedDiv.classList.remove("my_fadeout");
    //     speedDiv.style.opacity = 0.8;

    //     //if current timer then reset
    //     if (timerId) {
    //         clearTimeout(timerId);
    //         timerId = setTimeout(() => {
    //             speedDiv.classList.add("my_fadeout");
    //             timerId = null;
    //         }, 750);            
    //     }
    //     // no current timer then set one
    //     else {
    //         timerId = setTimeout(() => {
    //             speedDiv.classList.add("my_fadeout");
    //             timerId = null;
    //         }, 750);               
    //     }

    // };

 //invokes unnamed function - Immediately Invoked Function Expression(IIFE)