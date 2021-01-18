/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { CustomizationController } = require("./src/CustomizationController.js");
const { CustomizationCallbacks } = require("./src/CustomizationCallbacks.js");

module.exports.controller = new CustomizationController();
module.exports.callbacks = new CustomizationCallbacks();
