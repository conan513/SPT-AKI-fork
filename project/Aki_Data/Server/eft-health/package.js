/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { HealthController } = require("./src/controller.js");
const { HealthCallbacks } = require("./src/callbacks.js");
const { HealthConfig } = require("./src/config.js");

module.exports.controller = new HealthController();
module.exports.callbacks = new HealthCallbacks();
module.exports.config = new HealthConfig();
