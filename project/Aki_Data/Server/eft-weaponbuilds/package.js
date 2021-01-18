/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { PresetBuildController } = require("./src/PresetBuildController.js");
const { PresetBuildCallbacks } = require("./src/PresetBuildCallbacks.js");

module.exports.controller = new PresetBuildController();
module.exports.callbacks = new PresetBuildCallbacks();
