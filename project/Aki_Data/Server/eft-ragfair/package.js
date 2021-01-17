/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { RagfairServer } = require("./src/server.js");
const { RagfairController } = require("./src/controller.js");
const { RagfairCallbacks } = require("./src/callbacks.js");
const { RagfairConfig } = require("./src/config.js");

module.exports.server = new RagfairServer();
module.exports.controller = new RagfairController();
module.exports.callbacks = new RagfairCallbacks();
module.exports.config = new RagfairConfig();
