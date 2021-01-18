/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { WeatherController } = require("./src/WeatherController.js");
const { WeatherCallbacks } = require("./src/WeatherCallbacks.js");
const { WeatherConfig } = require("./src/WeatherConfig.js");

module.exports.controller = new WeatherController();
module.exports.callbacks = new WeatherCallbacks();
module.exports.config = new WeatherConfig();
