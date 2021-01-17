/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { AdditionsController } = require("./src/controller.js");
const { AdditionsCallbacks } = require("./src/callbacks.js");
const { AdditionsConfig } = require("./src/config.js");

module.exports.controller = new AdditionsController();
module.exports.callbacks = new AdditionsCallbacks();
module.exports.config = new AdditionsConfig();
