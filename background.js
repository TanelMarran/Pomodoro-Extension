let interval;
let project_id;
let current_time_entry_index = 0;
let current_time_entry_id;
let current_time_entry_length;
let project_name_conv = "Pomodoro-Extension";
let current_time_entry_clock_desc = "Focus";
let APIactive = false;

var desc = "";
var timer = -1;

/**
 * Initialize some storage variables.
 */
chrome.runtime.onInstalled.addListener(function() {
    chrome.storage.sync.set({
        APItoken : "",
        workspace_name : '',
        pomo_length : 25,
        break_length : 5,
        break_long_length : 10,
        pomo_number : 4
    });
});

chrome.storage.sync.get(['pomo_length'], function (data) {
    current_time_entry_length = data.pomo_length;
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
    }
    console.log("STATUS: " + requester.status);
    if (requester.status === 403) {
        console.log("Invalid API Token. ");
        callback(403);
    }
};

/**
 * Function that stops the current time entry.
 * @param callback
 */
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

/**
 * Function that starts a new time entry.
 * @param desc The description of the time entry (as defined by the user).
 */
let startT = function(desc) {
        startTogglEntry(desc, function (entry_id) {
            current_time_entry_id = entry_id;
            chrome.runtime.sendMessage({
                msg : "Time Entry Started/Stopped"
            });
            timer = 0;
            interval = setInterval(countTime,1000);
            //callback();
        });
};


/**
 * Function that counts, how long the current time entry has been running.
 * It also handles switching between focus time, breaks and long breaks.
 */
let countTime = function () {
    timer++;
    if(timer >= current_time_entry_length*60) {
        chrome.runtime.sendMessage({
            msg: "Turn Off Button"
        });
        stopT(function () {
            chrome.storage.sync.get(['pomo_length','break_length','break_long_length',"pomo_number"], function (data) {
                current_time_entry_index++;
                let desc_s = "Short Break";
                current_time_entry_clock_desc = "Short Break";
                if (current_time_entry_index % 2 === 0) {
                    //Create a Cat
                    chrome.tabs.create({url: chrome.extension.getURL("break.html")});
                    current_time_entry_length = data.break_length;
                    if (current_time_entry_index === data.pomo_number*2) {
                        current_time_entry_length = data.break_long_length;
                        desc_s = "Long Break";
                        current_time_entry_clock_desc = "Long Break";
                        current_time_entry_index = 0
                    }
                } else {
                    desc_s = desc;
                    current_time_entry_clock_desc = "Focus";
                    current_time_entry_length = data.pomo_length;
                }
                chrome.runtime.sendMessage({
                    msg: "Turn Off Button"
                });
                console.log(current_time_entry_clock_desc);
                startT(desc_s);
                sendTickMessage(0);
            });
        });
    }
    sendTickMessage();
    console.log(timer);
};

/**
 * Sends a message to the popup.html page so that it can update the timer visuals.
 * @param t
 * @param ctel
 */
let sendTickMessage = function(t = timer, ctel = current_time_entry_length) {
    chrome.runtime.sendMessage({
        msg: "Timer Tick",
        time: t,
        current_time_entry_length: ctel*60,
        ctecd: current_time_entry_clock_desc
    });
};

/**
 * Get the ID of the project named "Pomodoro-Extension" inside the defined workspace.
 * @param wordspace_id
 * @param callback
 */
let getTogglProjectID = function(wordspace_id, callback) {
    if (APIactive === false) {
        callback("")
    } else {
        chrome.storage.sync.get(['APItoken'], function (data) {
            let requester = new XMLHttpRequest();
            requester.onreadystatechange = function () {
                XMLresponse(requester, function () {
                    let response = JSON.parse(requester.responseText);
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
    }
};

/**
 * Creates a new toggle project in the assigned workspace.
 * @param workspace_id
 * @param callback
 */
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

/**
 * Gets the id of the toggle workspace by name
 * @param workspace_name
 * @param callback
 */
let getTogglWorkspaceID = function(workspace_name, callback) {
    chrome.storage.sync.get(['APItoken'], function (data) {
        let requester = new XMLHttpRequest();
        requester.onreadystatechange = function () {
            XMLresponse(requester,function () {
                if (requester.responseText === "") {
                    console.log("API deactivated.");
                    APIactive = false;
                    callback("");
                } else {
                    APIactive = true;
                    let response = JSON.parse(requester.responseText);
                    for(const workspace of response) {
                        const entries = Object.entries(workspace);
                        for(const [key, value] of entries) {
                            if(key === "name" && value === workspace_name) {
                                callback(parseInt(entries[0][1]));
                            }
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

/**
 * starts a new time entry in Toggl
 * @param entry_description
 * @param callback
 */
let startTogglEntry = function(entry_description, callback) {
    if (APIactive === false) {
        callback("");
    } else {
        chrome.storage.sync.get(['APItoken'], function (token) {
            let requester = new XMLHttpRequest();
            requester.onreadystatechange = function () {
                XMLresponse(requester, function () {
                    let response = JSON.parse(requester.responseText);
                    callback(response.data.id);
                });
            };

            let data = {
                "time_entry": {
                    "description": entry_description,
                    "pid": project_id,
                    "created_with": "Pomodoro-Extension"
                }
            };
            requester.open("post", "https://www.toggl.com/api/v8/time_entries/start");
            requester.setRequestHeader("Authorization", "Basic " + btoa(token.APItoken + ":api_token"));
            requester.setRequestHeader("Content-Type", "application/json");
            requester.send(JSON.stringify(data));
        });
    }
};

/**
 * Stops the Toggl time entry in with the given ID
 * @param time_entry_id
 * @param callback
 */
let stopTogglEntry = function(time_entry_id, callback) {
    if (APIactive === false) {
        callback("")
    } else {
        chrome.storage.sync.get(['APItoken'], function (token) {
            let requester = new XMLHttpRequest();
            requester.onreadystatechange = function () {
                XMLresponse(requester, function () {
                    callback(-4);
                });
            };

            requester.open("put", "https://www.toggl.com/api/v8/time_entries/" + time_entry_id + "/stop");
            requester.setRequestHeader("Authorization", "Basic " + btoa(token.APItoken + ":api_token"));
            requester.setRequestHeader("Content-Type", "application/json");
            requester.send();
        });
    }
};

/**
 * Message listener
 */
chrome.runtime.onMessage.addListener(function (request) {
    if (request.msg === "Timer activated") { //Message that notifies the background page that the user has clicked the button to start a new pomodoro cycle.
        chrome.storage.sync.get(['pomo_length'], function (data) {
            current_time_entry_length = data.pomo_length;
            current_time_entry_clock_desc = "Focus";
            current_time_entry_index++;
            startT(desc);
        });
    }
    if (request.msg === "Timer deactivated") { //Message that notifies the background page that the user has clicked the button to end the current pomodoro cycle.
        stopT(function () {
            current_time_entry_index = 0;
            chrome.storage.sync.get(['pomo_length'], function (data) {
                current_time_entry_length = data.pomo_length;
                current_time_entry_clock_desc = "Focus";
                sendTickMessage(0);
            });
        })
    }
    if (request.msg === "Description Updated") { //The user has changed the description of the next time entry
        desc = request.desc;
    }
    if (request.msg === "Timer Updated") { //Resets the timer if the user has started/stopped timing
        timer = request.timer;
    }
    if (request.msg === "API Token Updated") { //The user has changed the API token used for Toggl integration
        setProjectID();
        console.log("API Token Updated")
    }
});

/**
 * Function that sets up the current Toggl account with the proper workspace and project where the time entries will be saved.
 */
let setProjectID = function() {
    chrome.storage.sync.get(['workspace_name'], function (name) {
        getTogglWorkspaceID(name.workspace_name, function (workspace_id) {
            getTogglProjectID(workspace_id, function (pid) {
                if (pid === undefined) {
                    createTogglProjectID(workspace_id, function (pid) {
                        project_id = pid;
                    })
                } else {
                    project_id = pid;
                }
                console.log("Use API? " + APIactive);
            });
        });
    });
};

setProjectID();

