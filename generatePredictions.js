const predict = require("./model.js").predict;
const moment = require("moment");
const Json2csvParser = require('json2csv').Parser;
const fs = require("graceful-fs");

let current = moment().year(2016).month(0).date(1);
let end = moment();

let predictions = [];

while (current <= end) {
    let prediction = Object.assign(predict(current.date(), current.format("MMM"), current.year()),  {
        day: current.date(),
        month: current.format("MMM"),
        year: current.year(),
    });
    predictions.push(prediction);

    current.add(1, "day");
}
const parser = new Json2csvParser({});
const csv = parser.parse(predictions);

fs.writeFile("./data/predictions.csv", csv);
