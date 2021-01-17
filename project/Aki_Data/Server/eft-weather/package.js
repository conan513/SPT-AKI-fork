/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { WeatherController } = require("./src/controller.js");
const { WeatherCallbacks } = require("./src/callbacks.js");
const { WeatherConfig } = require("./src/config.js");

module.exports.controller = new WeatherController();
module.exports.callbacks = new WeatherCallbacks();
module.exports.config = new WeatherConfig();
