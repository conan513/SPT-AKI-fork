/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { TraderController } = require("./src/controller.js");
const { TraderCallbacks } = require("./src/callbacks.js");
const { TraderConfig } = require("./src/config.js");

module.exports.controller = new TraderController();
module.exports.callbacks = new TraderCallbacks();
module.exports.config = new TraderConfig();
