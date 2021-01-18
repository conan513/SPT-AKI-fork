/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { QuestController } = require("./src/QuestController.js");
const { QuestCallbacks } = require("./src/QuestCallbacks.js");
const { QuestHelpers } = require("./src/QuestHelpers.js");
const { QuestConfig } = require("./src/QuestConfig.js");

module.exports.controller = new QuestController();
module.exports.callbacks = new QuestCallbacks();
module.exports.helpers = new QuestHelpers();
module.exports.config = new QuestConfig();
