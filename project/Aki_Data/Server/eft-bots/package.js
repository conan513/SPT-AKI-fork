/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { BotController } = require("./src/controller.js");
const { BotCallbacks } = require("./src/callbacks.js");
const { BotConfig } = require("./src/config.js");
const { BotGenerator } = require("./src/generator.js");

module.exports.controller = new BotController();
module.exports.callbacks = new BotCallbacks();
module.exports.config = new BotConfig();
module.exports.generator = new BotGenerator();
