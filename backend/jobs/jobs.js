require('dotenv').config();

const database = require('../helpers/database');
database.establishConnection().then(r => console.log(new Date() + ' Database connection is initialized.'));

const CronJob = require('cron').CronJob;
const request = require('request-promise');
const Currency = require('../models/currency');
const Prediction = require('../models/prediction');
const predictionHelper = require('../helpers/prediction');
const User = require('../models/user');

const BASE_CURRENCY = 'USD';

const CURRENCIES = [
    'EUR',
    'JPY',
    'GBP',
    'CHF',
    'TRY',
];

class RoundRobinKeyPicker {
    constructor(keys) {
        this.keys = keys;
        this.length = keys.length;
        this.currIndex = 0;
    }

    next() {
        const item = this.keys[this.currIndex];
        this.currIndex = (this.currIndex + 1) % this.length;
        return item;
    }
}

const apiKeyPicker = new RoundRobinKeyPicker(process.env.ALPHAVANTAGE_API_KEY.split(','));
const apiUrl = process.env.ALPHAVANTAGE_URL;

const intradayRatesJob = new CronJob('0 */5 * * * *', async () => {
    const params = {
        function: 'FX_INTRADAY',
        from_symbol: BASE_CURRENCY,
        interval: '5min',
    };

    const options = {
        url: apiUrl,
        qs: params,
    };

    for (let i = 0; i < CURRENCIES.length; i++) {
        const code = CURRENCIES[i];
        params.to_symbol = code;
        params.apikey = apiKeyPicker.next();
        try {
            let response = await request.get(options);
            response = JSON.parse(response);
            if (response['Meta Data']) {
                const intradayRates = response['Time Series FX (5min)'];
                const rate = intradayRates[Object.keys(intradayRates)[0]]['4. close'];
                await Currency.updateOne({code}, {intradayRates, rate});
                console.log(new Date() + ' Intraday rates and rate are updated for ' + code);
            } else {
                console.log(new Date() + ' Request to AlphaVantage failed.' + JSON.stringify(response));
            }
        } catch (err) {
            console.log(new Date() + ' Intraday rates and rate could not be updated for ' + code + '. Err: ' + err);
        }
    }
}, null, false, 'Europe/Istanbul', null, false);


const dailyRatesJob = new CronJob('00 00 00 * * *', async () => {
    const params = {
        function: 'FX_DAILY',
        from_symbol: BASE_CURRENCY,
    };

    const options = {
        url: apiUrl,
        qs: params,
    };

    for (let i = 0; i < CURRENCIES.length; i++) {
        const code = CURRENCIES[i];
        params.to_symbol = code;
        params.apikey = apiKeyPicker.next();
        try {
            let response = await request.get(options);
            response = JSON.parse(response);
            if (response['Meta Data']) {
                const dailyRates = response['Time Series FX (Daily)'];
                await Currency.updateOne({code}, {dailyRates});
                console.log(new Date() + ' Daily rates are updated for ' + code);
            } else {
                console.log(new Date() + ' Request to AlphaVantage failed. ' + JSON.stringify(response));
            }
        } catch (err) {
            console.log(new Date() + ' Daily rates could not be updated for ' + code + '. Err: ' + err);
        }
    }
}, null, false, 'Europe/Istanbul', null, false);


const predictionJob = new CronJob('00 00 00 * * *', async () => {
    try {
        const predictions = await Prediction.find();

        const currencyCache = new Map();
        for (let i = 0; i < predictions.length; i++) {
            const prediction = predictions[i];
            if (prediction.equipmentType === predictionHelper.EQUIPMENT_TYPE.CURRENCY) {
                let currentRate;
                const currencyCode = prediction.currencyCode.toUpperCase();
                if (currencyCache.has(currencyCode)) {
                    currentRate = currencyCache.get(currencyCode);
                } else {
                    currentRate = await Currency
                        .findOne({code: currencyCode})
                        .select('rate -_id')
                        .exec();
                    currentRate = currentRate.rate;
                    currencyCache.set(currencyCode, currentRate);
                }
                const obj = {
                    $inc: {
                        totalPredictionCount: 1,
                    }
                };
                if ((prediction.snapshot <= currentRate
                        && prediction.prediction === predictionHelper.PREDICTION.INCREASE) ||
                    (prediction.snapshot > currentRate
                        && prediction.prediction === predictionHelper.PREDICTION.DECREASE)) {
                    obj['$inc'].successfulPredictionCount = 1;
                }
                await User.updateOne({_id: prediction.userId}, obj);
            }
            await Prediction.deleteOne({_id: prediction._id});
            console.log('Prediction successfully made for ' + prediction.userId);
        }
    } catch (err) {
        console.log(new Date() + ' Predictions cannot be processed. Err: ' + err);
    }

}, null, false, 'Europe/Istanbul', null, false);


predictionJob.start();
intradayRatesJob.start();
dailyRatesJob.start();
