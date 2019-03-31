let b_start = document.getElementById('start');
let i_text_pom = document.getElementById('text_pom');

let updateButtonHTML = function (x) {
    if (x === -1) {
        b_start.innerHTML = "Start";
        //i_text_pom.disabled = false;
    } else {
        b_start.innerHTML = "Stop";
        //i_text_pom.disabled = true;
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


i_text_pom.oninput = function() {
    chrome.runtime.sendMessage({
        msg : "Description Updated",
        desc : i_text_pom.value
    });
};

chrome.runtime.getBackgroundPage(function (data) {
    i_text_pom.setAttribute('value',data.desc);
    chrome.storage.sync.get(['pomo_length'], function (len) {
        document.getElementById("Timer").innerHTML = "Timer: " + formatTime(len.pomo_length*60);
    });
    updateButtonHTML(data.timer);
});

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if(request.msg === "Time Entry Started/Stopped") {
        updateButtonHTML(request.timer);
        b_start.disabled = false;
    }
    if(request.msg === "Turn Off Button") {
        //updateButtonHTML(request.timer);
        b_start.disabled = true;
    }
    if (request.msg === "Timer Tick") {
        document.getElementById("Timer").innerHTML = "Timer: " + formatTime(request.current_time_entry_length-request.time);
        console.log("Uuendatud");
    }
});

b_start.addEventListener('click', buttonClick);

document.getElementById("options").addEventListener('click',function () {
    chrome.runtime.openOptionsPage();
});