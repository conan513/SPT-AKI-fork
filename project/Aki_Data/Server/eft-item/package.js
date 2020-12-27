/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { EventHandler } = require("./src/events.js");
const { Callbacks } = require("./src/callbacks.js");

module.exports.eventHandler = new EventHandler();
module.exports.callbacks = new Callbacks();
