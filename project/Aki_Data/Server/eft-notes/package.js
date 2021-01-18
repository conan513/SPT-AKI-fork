/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { NoteController } = require("./src/NoteController.js");
const { NoteCallbacks } = require("./src/NoteCallbacks.js");

module.exports.controller = new NoteController();
module.exports.callbacks = new NoteCallbacks();
