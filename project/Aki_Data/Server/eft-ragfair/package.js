/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { RagfairServer } = require("./src/RagfairServer.js");
const { RagfairController } = require("./src/RagfairController.js");
const { RagfairCallbacks } = require("./src/RagfairCallbacks.js");
const { RagfairConfig } = require("./src/RagfairConfig.js");

module.exports.server = new RagfairServer();
module.exports.controller = new RagfairController();
module.exports.callbacks = new RagfairCallbacks();
module.exports.config = new RagfairConfig();
