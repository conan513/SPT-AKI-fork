/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { KeepaliveCallbacks } = require("./src/callbacks.js");

module.exports.callbacks = new KeepaliveCallbacks();
