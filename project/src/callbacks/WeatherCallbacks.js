/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const WeatherController = require("../controllers/WeatherController.js");

class WeatherCallbacks
{
    static getWeather(url, info, sessionID)
    {
        return https_f.response.getBody(WeatherController.generate());
    }
}

module.exports = WeatherCallbacks;
