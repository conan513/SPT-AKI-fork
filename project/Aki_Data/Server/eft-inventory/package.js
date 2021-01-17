/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { InventoryController } = require("./src/controller.js");
const { InventoryCallbacks } = require("./src/callbacks.js");
const { InventoryConfig } = require("./src/config.js");

module.exports.controller = new InventoryController();
module.exports.callbacks = new InventoryCallbacks();
module.exports.config = new InventoryConfig();
