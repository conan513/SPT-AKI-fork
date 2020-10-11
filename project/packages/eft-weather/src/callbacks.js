/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Callbacks
{
    constructor()
    {
        router_f.router.staticRoutes["/client/weather"] = this.getWeather.bind(this);
    }

    getWeather(url, info, sessionID)
    {
        return response_f.controller.getBody(weather_f.controller.generate());
    }
}

module.exports.Callbacks = Callbacks;
