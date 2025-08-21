(function() {
    //browser-polyfill library need for firefox - change "chrome" to "browser"
    chrome.storage.sync.get(["userDefaults"], (result) => {
        const defaults = result.userDefaults || {
            playbackRate: 2, 
            keybinds: {
                speedUp: {modifiers: [], key: "x"},
                speedDown: {modifiers: [], key: "z"}
            },
            maxPBR: 6,
            incrementPBRVal: .25,
            decrementPBRVal: .25
        };

        const defaultsString = JSON.stringify(defaults);
        const script = document.createElement("script");
        
        script.src = chrome.runtime.getURL("/src/script.js");
        script.dataset.defaults = defaultsString;

        document.documentElement.appendChild(script);

        script.onload = () => {
            script.remove();
        };        
    });
})();