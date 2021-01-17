/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { LocationController } = require("./src/controller.js");
const { LocationCallbacks } = require("./src/callbacks.js");
const { LocationConfig } = require("./src/config.js");
const { LocationGenerator } = require("./src/generator.js");

module.exports.controller = new LocationController();
module.exports.callbacks = new LocationCallbacks();
module.exports.config = new LocationConfig();
module.exports.generator = new LocationGenerator();
