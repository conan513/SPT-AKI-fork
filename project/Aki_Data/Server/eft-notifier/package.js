/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { NotifierController } = require("./src/NotifierController.js");
const { NotifierCallbacks } = require("./src/NotifierCallbacks.js");

module.exports.controller = new NotifierController();
module.exports.callbacks = new NotifierCallbacks();
