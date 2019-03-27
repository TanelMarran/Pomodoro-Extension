let interval;
let requester = new XMLHttpRequest();

chrome.runtime.onStartup.addListener(function() {
    chrome.storage.sync.set({
        desc: '',
        timer: -1,
        //APItoken : "0e6d3e786de75563787ad14c8bcdcfa2"
    }, function () {
        console.log("Startup");
    });
});

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({
        desc: '',
        timer: -1,
        APItoken : "0e6d3e786de75563787ad14c8bcdcfa2"
    }, function () {
        console.log("Installed");
    });
});

/*let Startup = function() {
    chrome.storage.sync.set({pipe: 'woowww'}, function () {
        chrome.storage.sync.get(['pipe'], function (data) {
            console.log("Fired " + data.pipe);
        });
    });
};*/

let countTime = function () {
    chrome.storage.sync.get(['timer'], function (data) {
        chrome.storage.sync.set({timer: data.timer+1}, function () {
            console.log(data.timer+1 + " sec");
        });
    });
};

let startTogglEntry = function(entryDescription) {
    chrome.storage.sync.get(['APItoken'], function (token) {
        let data = {
            "time_entry": {
                "description":entryDescription,
                "tags":["billed"],
                "pid":123,
                "created_with":"curl"
            }
        };
        requester.open("post","https://www.toggl.com/api/v8/time_entries");
        requester.setRequestHeader("Authorization", "Basic " + btoa(token.APItoken + ":api_token"));

        return 10;
    });
};


chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.msg === "Timer activated") {
        interval = setInterval(countTime,1000);
    }
    if (request.msg === "Timer deactivated") {
        clearInterval(interval);
    }
});

setInterval(function () {
    chrome.storage.sync.get(['pipe'], function (data) {
        console.log(data.pipe);
    })
},1000);