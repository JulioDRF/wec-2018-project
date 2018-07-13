const $ = require("cheerio");
const async = require("async");
const request = require("request");
const fs = require("fs");

const baseUrl = "http://weather.uwaterloo.ca/data.html";

const requestAndSaveCsv = (url) => {
    request(url, (err, response) => {
        if (err) {
            console.log(err);
        }
        let name = url.split("").filter(l => /^[a-zA-Z0-9_-]*$/.test(l)).join("");
        fs.writeFile(`./data/csv/${name}.csv`, response.body);
    });
};

request(baseUrl, (err, response) => {
    if (err) {
        console.log(err);
    }
    let csvUrls = [];
    $("td > a", response.body).each((index, link) => {
        if ($(link) && $(link).attr("href"))
            console.log($(link).attr("href"));
            csvUrls.push("http://weather.uwaterloo.ca/" + $(link).attr("href"));
    });

    async.eachLimit(csvUrls, 5, (url, callback) => {
        requestAndSaveCsv(url);
        callback(null, null);
    }, (err, data) => {
        if (err) {
            console.log(err);
        }
        console.log("Done!");
    });

});

