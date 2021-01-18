/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { ProfileController } = require("./src/ProfileController.js");
const { ProfileCallbacks } = require("./src/ProfileCallbacks.js");

module.exports.controller = new ProfileController();
module.exports.callbacks = new ProfileCallbacks();
