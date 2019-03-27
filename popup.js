let b_start = document.getElementById('start');
let i_text_pom = document.getElementById('text_pom');

chrome.storage.sync.get('desc',function (data) {
    i_text_pom.setAttribute('value',data.desc);
});

i_text_pom.oninput = function() {
    chrome.storage.sync.set({desc: i_text_pom.value}, function () {
        console.log("Uus desc on: " + i_text_pom.value);
    });
};

b_start.addEventListener('click',function () {
    console.log("Olen siin");
    let x = -1;
    chrome.storage.sync.get('timer',function (data) {
        x = data.timer;
        console.log("x uuendatud " + x);
        if (x === -1) {
            b_start.value = "Stop";
            chrome.storage.sync.set({timer: 0});
            console.log("Nüüd on 0");
        } else {
            b_start.value = "Start";
            chrome.storage.sync.set({timer: -1});
            console.log("Nüüd on -1");
        }
    });
});