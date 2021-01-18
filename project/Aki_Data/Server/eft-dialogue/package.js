/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { DialogueController } = require("./src/DialogueController.js");
const { DialogueCallbacks } = require("./src/DialogueCallbacks.js");

module.exports.controller = new DialogueController();
module.exports.callbacks = new DialogueCallbacks();
