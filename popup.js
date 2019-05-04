let b_start = document.getElementById('start');
let i_text_pom = document.getElementById('text_pom');

/**
 * Update the button's text depending on the variable x, which represents a timer
 * (-1 means that time isn't being counted and anything greater than that means that time is being counted)
 * @param x The variable that represents a timer.
 */
let updateButtonHTML = function (x) {
    if (x === -1) {
        b_start.innerHTML = "Start";
    } else {
        b_start.innerHTML = "Stop";
    }
};

let buttonClick = function () {
    chrome.runtime.getBackgroundPage(function (data) {
        let x = Math.sign(-Math.abs(Math.sign(data.timer) + 1));
        chrome.runtime.sendMessage({
            msg : "Timer Updated",
            timer : x
        });
        updateButtonHTML(x);
        console.log(x);
        b_start.disabled = true;
        let msg_text = "Timer activated";
        if (x === -1) {
            msg_text = "Timer deactivated";
        }
        chrome.runtime.sendMessage({
            msg: msg_text
        });
    });
};

/**
 * Formats seconds into a string with the format hh:mm:ss
 * @param time in seconds.
 * @returns Time formatted as hh:mm:s
 */
let formatTime = function(time) {
    console.log(time);
    let hours = (time-(time % 3600))/3600;
    time = time-hours*360;
    let minutes = (time-(time % 60))/60;
    if (minutes < 10) {
        minutes = '0'+minutes.toString();
    }
    time = time-minutes*60;
    let seconds = time;
    if (seconds < 10) {
        seconds = '0'+seconds.toString();
    }
    return (hours+":"+minutes+":"+seconds);
};

/**
 * Sends a message to the backgrounds script, informing it that the description of the next time entry has been updated.
 */
i_text_pom.oninput = function() {
    chrome.runtime.sendMessage({
        msg : "Description Updated",
        desc : i_text_pom.value
    });
};

/**
 * When the popup is opened, change the text and clock to reflect what is actually being measured in the backgroud script.
 */
chrome.runtime.getBackgroundPage(function (data) {
    i_text_pom.setAttribute('value',data.desc);
    chrome.storage.sync.get(['pomo_length'], function (len) {
        document.getElementById("Timer").innerHTML = "Focus: " + formatTime(len.pomo_length*60);
    });
    updateButtonHTML(data.timer);
});

chrome.runtime.onMessage.addListener(function (request) {
    if(request.msg === "Time Entry Started/Stopped") {
        updateButtonHTML(request.timer);
        b_start.disabled = false;
    }
    if(request.msg === "Turn Off Button") {
        b_start.disabled = true;
    }
    if (request.msg === "Timer Tick") { //Updates the HTML of the popup to reflect how the counter ticks down.
        document.getElementById("Timer").innerHTML = request.ctecd + ": " + formatTime(request.current_time_entry_length-request.time);
        console.log("Uuendatud");
    }
});

b_start.addEventListener('click', buttonClick);

document.getElementById("options").addEventListener('click',function () {
    chrome.runtime.openOptionsPage();
});