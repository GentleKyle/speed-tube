"use strict";
(function() {
    const DEFAULT_PLAYBACK_SPD = 2;

    //sets video default speed on first load
    window.addEventListener("load", () => {
        const video = document.getElementsByTagName("video")[0];

        if (!video) {
            return;
        }

        video.playbackRate = DEFAULT_PLAYBACK_SPD;
        //just play on load - so I do not have to press play
        //does not work
        video.autoplay = true;
    });

    window.addEventListener("keyup", (event) => {
        const video = document.getElementsByTagName("video")[0];

        if (!video) {
            return;
        }


        if (event.ctrlKey) {
            if (event.key === "ArrowRight") {
                incrementPBR(video);
            }
            if (event.key === "ArrowLeft") {
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
    }

    const decrementPBR = (video) => {
        const currentPBR = video.playbackRate;

        if (currentPBR > 0.25) {
            video.playbackRate = currentPBR - 0.25;
        }

        displaySpeed(video.playbackRate);
    }

    const displaySpeed = (speed) => {
        //create the div if no exist - first key press
        if (!document.getElementById("my_pbr_display")) {
            const videoDiv = document.getElementById("movie_player");

            const newDiv = document.createElement('div');
            newDiv.id = "my_pbr_display";
            newDiv.style.opacity = 0;

            videoDiv.append(newDiv);
        }
        
        const speedDiv = document.getElementById("my_pbr_display");
        speedDiv.textContent = `${speed}x`;
        speedDiv.style.opacity = 0.8;

    }

})(); //invokes unnamed function - Immediately Invoked Function Expression(IIFE)