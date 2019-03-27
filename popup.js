let b_start = document.getElementById('start');
let i_text_pom = document.getElementById('text_pom');

let updateButtonHTML = function (x) {
    if (x === -1) {
        b_start.innerHTML = "Start";
    } else {
        b_start.innerHTML = "Stop";
    }
};

let buttonClick = function () {
    chrome.storage.sync.get(['timer'], function (data) {
        let x = Math.sign(-Math.abs(Math.sign(data.timer) + 1));
        chrome.storage.sync.set({timer: x});
        popup.jsupdateButtonHTML(x);
        let msg_text = "Timer activated";
        if (x === -1) {
            msg_text = "Timer deactivated";
        }
        chrome.runtime.sendMessage({
            msg: msg_text
        });
        console.log("x uuendatud " + x);
    });
};



i_text_pom.oninput = function() {
    chrome.storage.sync.set({desc: i_text_pom.value}, function () {
        console.log("Uus desc on: " + i_text_pom.value);
    });
};

chrome.storage.sync.get(['timer','desc'],function (data) {
    updateButtonHTML(data.timer);
    i_text_pom.setAttribute('value',data.desc);
    console.log(data.desc);
});

b_start.addEventListener('click', buttonClick);