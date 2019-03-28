let interval;
let requester = new XMLHttpRequest();

var desc = "";
var timer = -1;

chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({
        APItoken : "0e6d3e786de75563787ad14c8bcdcfa2",
        pomo_length : 25,
        break_length : 5,
        break_long_length : 10
    }, function () {
        chrome.storage.sync.get(['desc','timer'], function (data) {
            desc = data.desc;
            timer = data.timer;
        })
    });
});

let countTime = function () {
    timer++;
    console.log(timer);
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
    if (request.msg === "Description Updated") {
        desc = request.desc;
    }
    if (request.msg === "Timer Updated") {
        timer = request.timer;
    }
});