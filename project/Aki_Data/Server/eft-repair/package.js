/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { RepairController } = require("./src/controller.js");
const { RepairCallbacks } = require("./src/callbacks.js");
const { RepairConfig } = require("./src/config.js");

module.exports.controller = new RepairController();
module.exports.callbacks = new RepairCallbacks();
module.exports.config = new RepairConfig();
