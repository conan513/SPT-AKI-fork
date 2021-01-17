/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { QuestController } = require("./src/controller.js");
const { QuestCallbacks } = require("./src/callbacks.js");
const { QuestHelpers } = require("./src/helpers.js");
const { QuestConfig } = require("./src/config.js");

module.exports.controller = new QuestController();
module.exports.callbacks = new QuestCallbacks();
module.exports.helpers = new QuestHelpers();
module.exports.config = new QuestConfig();
