/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { Controller } = require("./src/controller.js");
const { Callbacks } = require("./src/callbacks.js");

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
