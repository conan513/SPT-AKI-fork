/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { BotController } = require("./src/BotController.js");
const { BotCallbacks } = require("./src/BotCallbacks.js");
const { BotConfig } = require("./src/BotConfig.js");
const { BotGenerator } = require("./src/BotGenerator.js");

module.exports.controller = new BotController();
module.exports.callbacks = new BotCallbacks();
module.exports.config = new BotConfig();
module.exports.generator = new BotGenerator();
