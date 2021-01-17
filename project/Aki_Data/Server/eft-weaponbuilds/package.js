/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { PresetBuildController } = require("./src/controller.js");
const { PresetBuildCallbacks } = require("./src/callbacks.js");

module.exports.controller = new PresetBuildController();
module.exports.callbacks = new PresetBuildCallbacks();
