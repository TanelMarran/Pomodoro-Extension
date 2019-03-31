let getCat = function (callback) {
    let requester = new XMLHttpRequest();
    requester.onreadystatechange = function () {
        XMLresponse(requester, function () {
            let response = JSON.parse(requester.responseText);
            console.log(response);
            callback(response[0]);
        })
    };

    requester.open("get","https://api.thecatapi.com/v1/images/search",true);
    requester.setRequestHeader("x-api-key","94758b16-bb19-465b-af94-d5535fc7b8a7");
    requester.send();
};

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

getCat(function (data) {
    document.getElementById("cat").setAttribute("src",data.url);
    console.log("Kass!");
});

document.getElementById("button").addEventListener("click", function () {
    getCat(function (data) {
        document.getElementById("cat").setAttribute("src",data.url);
        console.log("Kass!");
    });
});