let b_start = document.getElementById('start');
let i_text_pom = document.getElementById('text_pom');

let updateButtonHTML = function (x) {
    if (x === -1) {
        b_start.innerHTML = "Start";
        i_text_pom.disabled = false;
    } else {
        b_start.innerHTML = "Stop";
        i_text_pom.disabled = true;
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
        let msg_text = "Timer activated";
        if (x === -1) {
            msg_text = "Timer deactivated";
        }
        chrome.runtime.sendMessage({
            msg: msg_text
        });
    });
};

i_text_pom.oninput = function() {
    chrome.runtime.sendMessage({
        msg : "Description Updated",
        desc : i_text_pom.value
    })
};

chrome.runtime.getBackgroundPage(function (data) {
    i_text_pom.setAttribute('value',data.desc);
    updateButtonHTML(data.timer);
});

b_start.addEventListener('click', buttonClick);