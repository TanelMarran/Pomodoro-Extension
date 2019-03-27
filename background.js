chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({desc: 'Yo dude'}, function (data) {
        console.log("Pomdoro desc on: 'Yo dude'");
    });
    chrome.storage.sync.set({timer: -1});

    /*chrome.declarativeContent.onPageChanged.removeRules(undefined, function() {
        chrome.declarativeContent.onPageChanged.addRules([{
            conditions: [new chrome.declarativeContent.PageStateMatcher({
            })
            ],
            actions: [new chrome.declarativeContent.ShowPageAction()]
        }]);
    });*/
});