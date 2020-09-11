"use strict";

class WeatherController
{
    generate()
    {
        let output = {};
        let weather = database_f.database.tables.templates.weather;

        // set weather
        if (gameplayConfig.location.forceWeatherEnabled)
        {
            output = weather[gameplayConfig.location.forceWeatherId];
        }
        else
        {
            output = utility.getRandomValue(weather);
        }

        // replace date and time
        if (gameplayConfig.location.realTimeEnabled)
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
        return response_f.getBody(weather_f.weatherController.generate());
    }
}

module.exports.weatherController = new WeatherController();
module.exports.WeatherCallbacks = new WeatherCallbacks();
