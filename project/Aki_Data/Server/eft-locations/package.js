/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { LocationController } = require("./src/LocationController.js");
const { LocationCallbacks } = require("./src/LocationCallbacks.js");
const { LocationConfig } = require("./src/LocationConfig.js");
const { LocationGenerator } = require("./src/LocationGenerator.js");

module.exports.controller = new LocationController();
module.exports.callbacks = new LocationCallbacks();
module.exports.config = new LocationConfig();
module.exports.generator = new LocationGenerator();
