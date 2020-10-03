/* weather.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class WeatherController
{
    generate()
    {
        let output = {};
        let weather = database_f.database.tables.templates.weather;

        // set weather
        if (weather_f.weatherConfig.force.enabled)
        {
            output = weather[weather_f.weatherConfig.force.id];
        }
        else
        {
            output = utility.getRandomValue(weather);
        }

        // replace date and time
        if (weather_f.weatherConfig.realtime)
        {
            // Apply acceleration to time computation.
            let computedDate = new Date();
            let deltaSeconds = utility.getServerUptimeInSeconds() * output.acceleration;
            computedDate.setSeconds(computedDate.getSeconds() + deltaSeconds);

            let time = utility.formatTime(computedDate).replace("-", ":").replace("-", ":");
            let date = utility.formatDate(computedDate);
            let datetime = date + " " + time;

            output.weather.timestamp = Math.floor(computedDate / 1000);
            output.weather.date = date;
            output.weather.time = datetime;
            output.date = date;
            output.time = time;
        }

        return output;
    }
}

class WeatherCallbacks
{
    constructor()
    {
        router.addStaticRoute("/client/weather", this.getWeather.bind());
    }

    getWeather(url, info, sessionID)
    {
        return response_f.responseController.getBody(weather_f.weatherController.generate());
    }
}

class WeatherConfig
{
    constructor()
    {
        this.realtime = true;
        this.force = {
            "enabled": false,
            "id": "sun"
        };
    }
}

module.exports.weatherController = new WeatherController();
module.exports.weatherCallbacks = new WeatherCallbacks();
module.exports.weatherConfig = new WeatherConfig();
