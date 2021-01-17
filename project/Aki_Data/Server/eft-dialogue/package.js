/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { DialogueController } = require("./src/controller.js");
const { DialogueCallbacks } = require("./src/callbacks.js");

module.exports.controller = new DialogueController();
module.exports.callbacks = new DialogueCallbacks();
