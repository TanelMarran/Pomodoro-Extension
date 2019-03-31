let pomo_number = document.getElementById("pomo_number");
let pomo_length = document.getElementById("pomo_length");
let break_length = document.getElementById("break_length");
let break_long_length = document.getElementById("break_long_length");
let APItoken = document.getElementById("APItoken");
let options = [APItoken,pomo_length,break_length,break_long_length,pomo_number];

chrome.storage.sync.get(['pomo_number',"pomo_length","break_length","break_long_length","APItoken"], function (data) {
    pomo_number.value = data.pomo_number;
    pomo_length.value = data.pomo_length;
    break_length.value = data.break_length;
    break_long_length.value = data.break_long_length;
    APItoken.value = data.APItoken;
});

break_length.oninput = function () {
    chrome.storage.sync.set({
        break_length : break_length.value
    })
};

pomo_number.oninput = function () {
    chrome.storage.sync.set({
        pomo_number : pomo_number.value
    })
};

pomo_length.oninput = function () {
    chrome.storage.sync.set({
        pomo_length : pomo_length.value
    })
};

APItoken.oninput = function () {
    chrome.storage.sync.set({
        APItoken : APItoken.value
    })
};

break_long_length.onChange = function () {
    chrome.storage.sync.set({
        break_long_length : break_long_length.value
    })
};
