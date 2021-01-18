/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { InraidController } = require("./src/InraidController.js");
const { InraidCallbacks } = require("./src/InraidCallbacks.js");
const { InraidConfig } = require("./src/InraidConfig {.js");

module.exports.controller = new InraidController();
module.exports.callbacks = new InraidCallbacks();
module.exports.config = new InraidConfig();
