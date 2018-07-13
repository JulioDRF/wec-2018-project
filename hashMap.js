const glob = require("glob");
const fs = require("fs");
const async = require("async");
const csvtojson = require("csvtojson");

glob("./data/csv/*.csv", {}, (err, fileNames) => {
    if (err) console.log(err);
    async.eachLimit(fileNames, 10, (fileName) => {
        fs.readFile(fileName, (err, body) => {
            if (err) console.log(err);
            
        })
    })
});