/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { HideoutController } = require("./src/controller.js");
const { HideoutCallbacks } = require("./src/callbacks.js");
const { HideoutConfig } = require("./src/config.js");

module.exports.controller = new HideoutController();
module.exports.callbacks = new HideoutCallbacks();
module.exports.config = new HideoutConfig();