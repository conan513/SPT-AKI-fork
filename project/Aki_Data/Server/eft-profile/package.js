/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { ProfileController } = require("./src/controller.js");
const { ProfileCallbacks } = require("./src/callbacks.js");

module.exports.controller = new ProfileController();
module.exports.callbacks = new ProfileCallbacks();
