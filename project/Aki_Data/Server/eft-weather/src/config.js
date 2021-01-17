/* config.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class WeatherConfig
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
                "max": 3
            },
            "windGustiness": {
                "min": 0,
                "max": 1
            },
            "rain": {
                "min": 1,
                "max": 4
            },
            "rainIntensity": {
                "min": 0.1,
                "max": 1
            },
            "fog": {
                "min": 0.002,
                "max": 0.15
            },
            "temp": {
                "min": 0,
                "max": 16
            },
            "pressure": {
                "min": 760,
                "max": 764
            }
        };
    }
}

module.exports.WeatherConfig = WeatherConfig;
