/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { MatchController } = require("./src/MatchController.js");
const { MatchCallbacks } = require("./src/MatchCallbacks.js");
const { MatchConfig } = require("./src/MatchConfig.js");

module.exports.controller = new MatchController();
module.exports.callbacks = new MatchCallbacks();
module.exports.config = new MatchConfig();
