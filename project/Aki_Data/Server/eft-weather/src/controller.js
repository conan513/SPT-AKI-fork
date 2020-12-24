/* controller.js
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

        return result;
    }

    generateWeather(data)
    {
        const enableRain = common_f.random.getBool();
        const enableFog = common_f.random.getBool();

        data.weather.cloud = this.getRandomFloat("clouds");
        data.weather.wind_speed = this.getRandomInt("windSpeed");
        data.weather.wind_direction = this.getRandomInt("windDirection");
        data.weather.wind_gustiness = this.getRandomFloat("windGustiness");
        data.weather.rain = (enableRain) ? this.getRandomInt("rain") : 0;
        data.weather.rain_intensity = (enableRain) ? this.getRandomFloat("rainIntensity") : 0;
        data.weather.fog = (enableFog) ? this.getRandomFloat("fog") : 0;
        data.weather.temp = this.getRandomInt("temp");
        data.weather.pressure = this.getRandomInt("pressure");

        return data;
    }

    calculateTime(data)
    {
        // get time acceleration
        const deltaSeconds = Math.floor(process.uptime()) * weather_f.config.acceleration;
        const computedDate = new Date();

        computedDate.setSeconds(computedDate.getSeconds() + deltaSeconds);

        // assign time
        const time = common_f.time.formatTime(computedDate).replace("-", ":").replace("-", ":");
        const date = common_f.time.formatDate(computedDate);
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
        return parseFloat(common_f.random.getFloat(weather_f.config.weather[node].min,
            weather_f.config.weather[node].max).toPrecision(3));
    }

    getRandomInt(node)
    {
        return common_f.random.getInt(weather_f.config.weather[node].min,
            weather_f.config.weather[node].max);
    }
}

module.exports.Controller = Controller;
