let interval;
//let requester = new XMLHttpRequest();
let project_id;
let current_time_entry_index = 0;
let current_time_entry_id;
let current_time_entry_length;
let project_name_conv = "Pomodoro-Extension";

var desc = "";
var timer = -1;

/**
 * Initialize some storage variables.
 */
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({
        APItoken : "0e6d3e786de75563787ad14c8bcdcfa2",
        workspace_name : 'Main',
        pomo_length : 0.5,
        break_length : 0.05,
        break_long_length : 0.25
    }, function () {
        chrome.storage.sync.get(['desc','timer'], function (data) {
            desc = data.desc;
            timer = data.timer;
        })
    });
});

/**
 * Function that guarantees that the requested data was properly posted or retrieved.
 * @param requester
 * @param callback
 * @constructor
 */
let XMLresponse = function(requester,callback) {
    if (requester.readyState === 4) {
        if (requester.status === 200) {
            callback();
            console.log("Request succeeded. ");
        }

        if (requester.status === 404) {
            console.log("File or resource not found.")
        }
    }
};

let stopT = function(callback) {
    stopTogglEntry(current_time_entry_id, function () {
        current_time_entry_id = -4;
        timer = -1;
        chrome.runtime.sendMessage({
            msg : "Time Entry Started/Stopped",
            timer : timer
        });
        clearInterval(interval);
        callback();
    });
};

let startT = function(desc, callback) {
        startTogglEntry(desc, function (entry_id) {
            current_time_entry_id = entry_id;
            chrome.runtime.sendMessage({
                msg : "Time Entry Started/Stopped"
            });
            interval = setInterval(countTime,1000);
            callback();
        });
};


let countTime = function () {
    timer++;
    if(timer === current_time_entry_length*60) {
        stopT(function () {
            chrome.storage.sync.get(['pomo_length','break_length','break_long_length'], function (data) {
                current_time_entry_index++;
                let desc_s = "Short Break";
                if (current_time_entry_index % 2 === 0) {
                    current_time_entry_length = data.break_length;
                    if (current_time_entry_index === 8) {
                        current_time_entry_length = data.break_long_length;
                        desc_s = "Long Break";
                        current_time_entry_index = 0
                    }
                } else {
                    desc_s = desc;
                    current_time_entry_length = data.pomo_length;
                }
                startT(desc_s);
            });
        });
    }
    console.log(timer);
};

/**
 * Get the ID of the project named "Pomodoro-Extension" inside the defined workspace.
 * @param wordspace_id
 * @param callback
 */
let getTogglProjectID = function(wordspace_id, callback) {
    chrome.storage.sync.get(['APItoken'], function (data) {
        let requester = new XMLHttpRequest();
        requester.onreadystatechange = function () {
            XMLresponse(requester,function () {
                let response = JSON.parse(requester.responseText);
                //console.log(response);
                let correct_id;
                if (response !== null) {
                    for (const workspace of response) {
                        const entries = Object.entries(workspace);
                        for (const [key, value] of entries) {
                            if (key === "name" && value === project_name_conv) {
                                correct_id = parseInt(entries[0][1]);
                            }
                        }
                    }
                }
                callback(correct_id);
            });
        };
        requester.open("get", "https://www.toggl.com/api/v8/workspaces/" + wordspace_id + "/projects", true);
        requester.setRequestHeader("Authorization", "Basic " + btoa(data.APItoken + ":api_token"));
        requester.setRequestHeader("Content-Type", "application/json");
        requester.send();
    });
};

let createTogglProjectID = function(workspace_id, callback) {
    chrome.storage.sync.get(['APItoken'], function (token) {
        let requester = new XMLHttpRequest();

        requester.onreadystatechange = function() {
            XMLresponse(requester, function () {
                let response = JSON.parse(requester.responseText);
                //console.log(JSON.stringify(response));
                callback(response.data.id);
            });
        };

        let data = {
            "project":{
                "name": project_name_conv,
                "wid": workspace_id,
            }
        };

        requester.open("post","https://www.toggl.com/api/v8/projects",true);
        requester.setRequestHeader("Authorization", "Basic " + btoa(token.APItoken + ":api_token"));
        requester.setRequestHeader("Content-Type","application/json");
        requester.send(JSON.stringify(data));
    });
};

let getTogglWorkspaceID = function(workspace_name, callback) {
    chrome.storage.sync.get(['APItoken'], function (data) {
        let requester = new XMLHttpRequest();
        requester.onreadystatechange = function () {
            XMLresponse(requester,function () {
                let response = JSON.parse(requester.responseText);
                for(const workspace of response) {
                    const entries = Object.entries(workspace);
                    for(const [key, value] of entries) {
                        if(key === "name" && value === workspace_name) {
                            callback(parseInt(entries[0][1]));
                        }
                    }
                }
            });
        };
        requester.open("get","https://www.toggl.com/api/v8/workspaces", true);
        requester.setRequestHeader("Authorization", "Basic " + btoa(data.APItoken+":api_token"));
        requester.setRequestHeader("Content-Type","application/json");
        requester.send();
    });
};


let startTogglEntry = function(entry_description, callback) {
    chrome.storage.sync.get(['APItoken'], function (token) {
        let requester = new XMLHttpRequest();
        requester.onreadystatechange = function() {
            XMLresponse(requester, function () {
                let response = JSON.parse(requester.responseText);
                callback(response.data.id);
            });
        };

        let data = {
            "time_entry": {
                "description":entry_description,
                "pid":project_id,
                "created_with":"Pomodoro-Extension"
            }
        };
        requester.open("post","https://www.toggl.com/api/v8/time_entries/start");
        requester.setRequestHeader("Authorization", "Basic " + btoa(token.APItoken + ":api_token"));
        requester.setRequestHeader("Content-Type","application/json");
        requester.send(JSON.stringify(data));
    });
};

let stopTogglEntry = function(time_entry_id, callback) {
    chrome.storage.sync.get(['APItoken'], function (token) {
        let requester = new XMLHttpRequest();
        requester.onreadystatechange = function() {
            XMLresponse(requester, function () {
                callback(-4);
            });
        };

        requester.open("put","https://www.toggl.com/api/v8/time_entries/"+time_entry_id+"/stop");
        requester.setRequestHeader("Authorization", "Basic " + btoa(token.APItoken + ":api_token"));
        requester.setRequestHeader("Content-Type","application/json");
        requester.send();
    });
};

/**
 * Message listener
 */
chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.msg === "Timer activated") {
        chrome.storage.sync.get(['pomo_length'], function (data) {
            current_time_entry_length = data.pomo_length;
            current_time_entry_index++;
            startT(desc);
        });
    }
    if (request.msg === "Timer deactivated") {
        stopT(function () {
            current_time_entry_index = 0;
        })
    }
    if (request.msg === "Description Updated") {
        desc = request.desc;
    }
    if (request.msg === "Timer Updated") {
        timer = request.timer;
    }
});

chrome.storage.sync.get(['workspace_name'], function (name) {
    getTogglWorkspaceID(name.workspace_name,function (workspace_id) {
        getTogglProjectID(workspace_id,function (pid) {
            if(pid === undefined) {
                createTogglProjectID(workspace_id,function (pid) {
                    project_id = pid;
                })
            } else {
                project_id = pid;
            }
        });
    });
});