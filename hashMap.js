const glob = require("glob");
const fs = require("graceful-fs");
const async = require("async");
const csv = require("csvtojson");

glob("./data/csv/*.csv", {}, (err, fileNames) => {
    if (err) console.log(err);
    // No data from 2016, 2017 or 2018
    // Also only take daily summary data.
    fileNames = fileNames.filter(fn => fn.indexOf("2016") === -1 &&
                                       fn.indexOf("2017") === -1 &&
                                       fn.indexOf("2018") === -1 &&
                                       fn.indexOf("Daily_summary") !== -1);

    let hashmap = {};

    async.eachLimit(fileNames, 5, (fileName, callback) => {
        csv().fromFile(fileName).then(jsonArray => {
            jsonArray.forEach(entry => {
                let yearSuffix = entry.Date.split("-")[2];
                let yearPrefix = "20";
                if (parseInt(yearSuffix) == 99) yearPrefix = "19";
                if (parseInt(yearSuffix) == 1998) yearPrefix = "";
                let year = yearPrefix + yearSuffix;
                let month = entry.Date.split("-")[1];
                let day = entry.Date.split("-")[0];
                if (!entry || !year || !month || !day) return false;
                if (!hashmap[year]) {
                    hashmap[year] = {};
                }
                if (!hashmap[year][month]) {
                    hashmap[year][month] = {};
                }
                if (!hashmap[year][month][day]) {
                    let low_temp = null;
                    if (entry["Low temperature"] && entry["Low temperature"].indexOf("Not Available") === -1) {
                        low_temp = entry["Low temperature"];
                    }
                    let high_temp = null;
                    if (entry["High temperature"] && entry["High temperature"].indexOf("Not Available") === -1) {
                        high_temp = entry["High temperature"];
                    }
                    let precipitation = null;
                    if (entry["Precipitation"] && entry["Precipitation"].indexOf("Not Available") === -1) {
                        precipitation = entry["Precipitation"];
                    }
                    hashmap[year][month][day] = {
                        low_temp,
                        high_temp,
                        precipitation,
                    };
                }
            });
        }).then(() => callback());          
    }, (err) => {
        if (err) console.log(err);
        fs.writeFile("./data/json/dailySummaryHashmap.json", JSON.stringify(hashmap, null , 2));
    });
});

