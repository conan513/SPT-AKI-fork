/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { RepairController } = require("./src/RepairController.js");
const { RepairCallbacks } = require("./src/RepairCallbacks.js");
const { RepairConfig } = require("./src/RepairConfig.js");

module.exports.controller = new RepairController();
module.exports.callbacks = new RepairCallbacks();
module.exports.config = new RepairConfig();
