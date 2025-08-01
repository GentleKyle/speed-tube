"use strict";
(function() {
    const DEFAULT_PLAYBACK_SPD = 2;

    const handleLoad = () => {
        setTimeout(() => {
            const video = document.getElementsByTagName("video")[0];

            if (!video) {
                return;
            }

            //sets video default speed on first load
            video.playbackRate = DEFAULT_PLAYBACK_SPD;
        }, 500);
        
    };
    
    //first page load - you write/paste in a video url directly
    window.addEventListener("load", handleLoad);
    //every 1sec check if url has changed - link click
    let currentUrl = location.href;
    setInterval(() => {
        if (location.href !== currentUrl) {
            currentUrl = location.href;
            handleLoad();
        }
    }, 1022);


    window.addEventListener("keyup", (event) => {
        const video = document.getElementsByTagName("video")[0];

        if (!video) {
            return;
        }

        if (event.ctrlKey) {
            if (event.key === "ArrowUp") {
                incrementPBR(video);
            }
            if (event.key === "ArrowDown") {
                decrementPBR(video);
            }
        }
    });


    const incrementPBR = (video) => {
        const currentPBR = video.playbackRate;

        if (currentPBR < 6) {
            video.playbackRate = currentPBR + 0.25;
        }

        displaySpeed(video.playbackRate);
    };

    const decrementPBR = (video) => {
        const currentPBR = video.playbackRate;

        if (currentPBR > 0.25) {
            video.playbackRate = currentPBR - 0.25;
        }

        displaySpeed(video.playbackRate);
    };

    let timerId = null;
    const displaySpeed = (speed) => {
        //create the div if no exist - first key press
        if (!document.getElementById("my_pbr_display")) {
            const videoDiv = document.getElementById("movie_player");

            const newDiv = document.createElement('div');
            newDiv.id = "my_pbr_display";
            newDiv.addEventListener("animationend", () => {
                newDiv.classList.remove("my_fadeout");
                newDiv.style.opacity = 0;
            })

            videoDiv.append(newDiv);
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

    };

})(); //invokes unnamed function - Immediately Invoked Function Expression(IIFE)