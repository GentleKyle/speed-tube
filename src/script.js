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
    }

    const decrementPBR = (video) => {
        const currentPBR = video.playbackRate;

        if (currentPBR > 0.25) {
            video.playbackRate = currentPBR - 0.25;
        }
    }



})(); //invokes unnamed function - Immediately Invoked Function Expression(IIFE)