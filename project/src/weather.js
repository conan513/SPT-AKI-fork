/* weather.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Controller
{
    generate()
    {
        let result = utility.getRandomValue(database_f.database.tables.templates.weather);

        // replace date and time
        if (weather_f.config.realtime)
        {
            // Apply acceleration to time computation.
            let computedDate = new Date();
            let deltaSeconds = utility.getServerUptimeInSeconds() * result.acceleration;
            computedDate.setSeconds(computedDate.getSeconds() + deltaSeconds);

            let time = utility.formatTime(computedDate).replace("-", ":").replace("-", ":");
            let date = utility.formatDate(computedDate);
            let datetime = `${date} ${time}`;

            result.weather.timestamp = Math.floor(computedDate / 1000);
            result.weather.date = date;
            result.weather.time = datetime;
            result.date = date;
            result.time = time;
        }

        return result;
    }
}

class Callbacks
{
    constructor()
    {
        router.addStaticRoute("/client/weather", this.getWeather.bind());
    }

    getWeather(url, info, sessionID)
    {
        return response_f.controller.getBody(weather_f.controller.generate());
    }
}

class Config
{
    constructor()
    {
        this.realtime = true;
    }
}

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
module.exports.config = new Config();
