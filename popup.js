let b_start = document.getElementById('start');
let i_text_pom = document.getElementById('text_pom');

chrome.storage.sync.get('pomodoro_desc',function (data) {
    i_text_pom.setAttribute('value',data.pomodoro_desc);
});

i_text_pom.oninput = function() {
    chrome.storage.sync.set({pomodoro_desc: i_text_pom.value}, function () {
        console.log("Uus pomodoro desc on: " + i_text_pom.value);
    });
    i_text_pom.disabled = true;
};