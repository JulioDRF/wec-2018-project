const hashmap = require("./data/json/dailySummaryHashmap.json");
const moment = require("moment");

const computeAverage = (month, day) => {
    let precipitation_sum = 0;
    let low_temp_sum = 0;
    let high_temp_sum = 0;

    let valid_precipitation_years = 0;
    let valid_low_temp_years = 0;
    let valid_high_temp_years = 0;

    for (year in hashmap) {
        if (!hashmap[year][month][day]) continue;
        if (hashmap[year][month][day].precipitation) {
            precipitation_sum += parseFloat(hashmap[year][month][day].precipitation);
            valid_precipitation_years++;
        }
        if (hashmap[year][month][day].low_temp) {
            low_temp_sum += parseFloat(hashmap[year][month][day].low_temp);
            valid_low_temp_years++;
        }
        if (hashmap[year][month][day].high_temp) {
            high_temp_sum += parseFloat(hashmap[year][month][day].high_temp);
            valid_high_temp_years++;
        }
    }
    return {
        precipitation: precipitation_sum / valid_precipitation_years,
        high_temp: high_temp_sum / valid_high_temp_years,
        low_temp: low_temp_sum / valid_low_temp_years,
    };
};

const computeAverageChange = (month, day) => {
    let precipitation_change_sum = 0;
    let low_temp_change_sum = 0;
    let high_temp_change_sum = 0;

    let valid_precipitation_years = 0;
    let valid_low_temp_years = 0;
    let valid_high_temp_years = 0;

    for (year in hashmap) {
        if (!hashmap[year][month][day]) continue;
        if (Object.keys(hashmap).indexOf(year) + 1 === Object.keys(hashmap).length) continue;
        if (!hashmap[parseInt(year) + 1][month][day]) continue;
        if (hashmap[year][month][day].precipitation) {
            precipitation_change_sum += parseFloat(hashmap[parseInt(year) + 1][month][day].precipitation) - parseFloat(hashmap[year][month][day].precipitation);
            valid_precipitation_years++;
        }
        if (hashmap[year][month][day].low_temp) {
            low_temp_change_sum += parseFloat(hashmap[parseInt(year) + 1][month][day].low_temp) - parseFloat(hashmap[year][month][day].low_temp);
            valid_low_temp_years++;
        }
        if (hashmap[year][month][day].high_temp) {
            high_temp_change_sum += parseFloat(hashmap[parseInt(year) + 1][month][day].high_temp) - parseFloat(hashmap[year][month][day].high_temp);
            valid_high_temp_years++;
        }
    }

    return {
        precipitation: precipitation_change_sum / valid_precipitation_years,
        high_temp: high_temp_change_sum / valid_high_temp_years,
        low_temp: low_temp_change_sum / valid_low_temp_years,
    };
};

const addChangeToAverage = (average, change) => {
    obj = {
        precipitation: average.precipitation + change.precipitation,
        low_temp: average.low_temp + change.low_temp,
        high_temp: average.high_temp + change.high_temp,
    };
    return obj;
};

const predict = (day, month, year) => {
    const yearlyTemperatureIncrease = (parseInt(year)-2014)*0.02;
    const yearlyPrecipitationIncrease = Math.pow(1.05, (parseInt(year)-2014));
    let currentDay = moment().month(month).date(day);
    let nextDay = currentDay.clone().add(1, "day");
    let prevDay = currentDay.clone().subtract(1, "day");

    let predictedCurrentDay = addChangeToAverage(computeAverage(currentDay.format("MMM"), currentDay.date()), computeAverageChange(currentDay.format("MMM"), currentDay.date()));
    let predictedNextDay = addChangeToAverage(computeAverage(nextDay.format("MMM"), nextDay.date()), computeAverageChange(nextDay.format("MMM"), nextDay.date()));
    let predictedPrevDay = addChangeToAverage(computeAverage(prevDay.format("MMM"), prevDay.date()), computeAverageChange(prevDay.format("MMM"), prevDay.date()));

    let avgPreviousNextPrecipitation = (predictedPrevDay.precipitation + predictedNextDay.precipitation) / 2;
    let avgPreviousNextLowTemp = (predictedPrevDay.low_temp + predictedNextDay.low_temp) / 2;
    let avgPreviousNextHighTemp = (predictedPrevDay.high_temp + predictedNextDay.high_temp) / 2;

    let predictedCurrentPrecipitation = yearlyPrecipitationIncrease * (avgPreviousNextPrecipitation + predictedCurrentDay.precipitation) / 2;
    if (!predictedCurrentPrecipitation || predictedCurrentPrecipitation < 0) predictedCurrentPrecipitation = 0;
    let predictedCurrentLowTemp = yearlyTemperatureIncrease + (avgPreviousNextLowTemp + predictedCurrentDay.low_temp) / 2;
    let predictedCurrentHighTemp = yearlyTemperatureIncrease + (avgPreviousNextHighTemp + predictedCurrentDay.high_temp) / 2;


    return {
        precipitation: predictedCurrentPrecipitation,
        low_temp: predictedCurrentLowTemp,
        high_temp:predictedCurrentHighTemp,
    };
    
};

module.exports = {
    predict
};
