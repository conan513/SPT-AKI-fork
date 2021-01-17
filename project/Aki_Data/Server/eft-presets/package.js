/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { PresetController } = require("./src/controller.js");
const { PresetCallbacks } = require("./src/callbacks.js");

module.exports.controller = new PresetController();
module.exports.callbacks = new PresetCallbacks();
