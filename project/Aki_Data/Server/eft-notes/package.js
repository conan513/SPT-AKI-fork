/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { NoteController } = require("./src/controller.js");
const { NoteCallbacks } = require("./src/callbacks.js");

module.exports.controller = new NoteController();
module.exports.callbacks = new NoteCallbacks();
