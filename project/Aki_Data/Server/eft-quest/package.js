/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { Controller } = require("./src/controller.js");
const { Callbacks } = require("./src/callbacks.js");
const { Helpers } = require("./src/helpers.js");
const { Config } = require("./src/config.js");

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
module.exports.helpers = new Helpers();
module.exports.config = new Config();
