/* weather.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

class Controller
{
    generate()
    {
        let result = { "weather": {} };

        result = this.calculateTime(result);
        result = this.generateWeather(result);

        console.log(result);

        return result;
    }

    generateWeather(data)
    {
        const enableRain = utility.getRandomBool();
        const enableFog = utility.getRandomBool();

        data.weather.cloud = this.getRandomFloat("clouds");
        data.weather.wind_speed = this.getRandomFloat("windSpeed");
        data.weather.wind_direction = this.getRandomInt("windDirection");
        data.weather.wind_gustiness = this.getRandomFloat("windGustiness");
        data.weather.rain = (enableRain) ? this.getRandomFloat("rain") : 0;
        data.weather.rain_intensity = (enableRain) ? this.getRandomFloat("rainIntensity") : 0;
        data.weather.fog = (enableFog) ? this.getRandomFloat("fog") : 0;
        data.weather.temp = this.getRandomInt("temp");
        data.weather.pressure = this.getRandomInt("pressure");

        return data;
    }

    calculateTime(data)
    {
        // get time acceleration
        const deltaSeconds = utility.getServerUptimeInSeconds() * weather_f.config.acceleration;
        const computedDate = new Date();

        computedDate.setSeconds(computedDate.getSeconds() + deltaSeconds);

        // assign time
        const time = utility.formatTime(computedDate).replace("-", ":").replace("-", ":");
        const date = utility.formatDate(computedDate);
        const datetime = `${date} ${time}`;

        data.weather.timestamp = Math.floor(computedDate / 1000);
        data.weather.date = date;
        data.weather.time = datetime;
        data.date = date;
        data.time = time;
        data.acceleration = weather_f.config.acceleration;

        return data;
    }

    getRandomFloat(node)
    {
        return parseFloat(utility.getRandomFloat(weather_f.config.weather[node].min,
            weather_f.config.weather[node].max).toPrecision(3));
    }

    getRandomInt(node)
    {
        return utility.getRandomInt(weather_f.config.weather[node].min,
            weather_f.config.weather[node].max);
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
        this.acceleration = 7;
        this.weather = {
            "clouds": {
                "min": -1.5,
                "max": 1.5
            },
            "windSpeed": {
                "min": 0,
                "max": 3
            },
            "windDirection": {
                "min": 0,
                "max": 359
            },
            "windGustiness": {
                "min": 0,
                "max": 1
            },
            "rain": {
                "min": 1,
                "max": 3
            },
            "rainIntensity": {
                "min": 0.1,
                "max": 1
            },
            "fog": {
                "min": 0.1,
                "max": 0.15
            },
            "temp": {
                "min": 10,
                "max": 20
            },
            "pressure": {
                "min": 763,
                "max": 763
            }
        };
    }
}

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
module.exports.config = new Config();
