/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { PresetController } = require("./src/PresetController.js");
const { PresetCallbacks } = require("./src/PresetCallbacks.js");

module.exports.controller = new PresetController();
module.exports.callbacks = new PresetCallbacks();
