/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { SaveServer } = require("./src/server.js");
const { SaveCallbacks } = require("./src/callbacks.js");

module.exports.server = new SaveServer();
module.exports.callbacks = new SaveCallbacks();
