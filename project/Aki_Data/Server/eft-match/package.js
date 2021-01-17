/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { MatchController } = require("./src/controller.js");
const { MatchCallbacks } = require("./src/callbacks.js");
const { MatchConfig } = require("./src/config.js");

module.exports.controller = new MatchController();
module.exports.callbacks = new MatchCallbacks();
module.exports.config = new MatchConfig();
