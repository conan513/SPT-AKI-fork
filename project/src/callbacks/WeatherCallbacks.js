/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class WeatherCallbacks
{
    constructor()
    {
        https_f.router.onStaticRoute["/client/weather"] = this.getWeather.bind(this);
    }

    getWeather(url, info, sessionID)
    {
        return https_f.response.getBody(weather_f.controller.generate());
    }
}

module.exports = new WeatherCallbacks();
