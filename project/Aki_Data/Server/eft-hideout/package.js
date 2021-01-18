/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { HideoutController } = require("./src/HideoutController.js");
const { HideoutCallbacks } = require("./src/HideoutCallbacks.js");
const { HideoutConfig } = require("./src/HideoutConfig.js");

module.exports.controller = new HideoutController();
module.exports.callbacks = new HideoutCallbacks();
module.exports.config = new HideoutConfig();