/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const WeatherController = require("../controllers/WeatherController.js");
const HttpResponse = require("../utils/HttpResponse.js");

class WeatherCallbacks
{
    static getWeather(url, info, sessionID)
    {
        return HttpResponse.getBody(WeatherController.generate());
    }
}

module.exports = WeatherCallbacks;
