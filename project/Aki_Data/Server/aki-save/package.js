/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { SaveServer } = require("./src/SaveServer.js");
const { SaveCallbacks } = require("./src/SaveCallbacks.js");

module.exports.server = new SaveServer();
module.exports.callbacks = new SaveCallbacks();
