/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { InventoryController } = require("./src/InventoryController.js");
const { InventoryCallbacks } = require("./src/InventoryCallbacks.js");
const { InventoryConfig } = require("./src/InventoryConfig.js");

module.exports.controller = new InventoryController();
module.exports.callbacks = new InventoryCallbacks();
module.exports.config = new InventoryConfig();
