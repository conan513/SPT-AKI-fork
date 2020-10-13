/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { EventHandler } = require("./src/events.js");
const { Controller } = require("./src/controller.js");
const { Callbacks } = require("./src/callbacks.js");
const { Config } = require("./src/config.js");

module.exports.eventHandler = new EventHandler();
module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
module.exports.config = new Config();
