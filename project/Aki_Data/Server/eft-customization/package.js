/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { CustomizationController } = require("./src/controller.js");
const { CustomizationCallbacks } = require("./src/callbacks.js");

module.exports.controller = new CustomizationController();
module.exports.callbacks = new CustomizationCallbacks();
