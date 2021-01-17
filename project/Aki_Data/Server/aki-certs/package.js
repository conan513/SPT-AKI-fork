/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { CertController } = require("./src/controller.js");
const { CertCallbacks } = require("./src/callbacks");

module.exports.controller = new CertController();
module.exports.callbacks = new CertCallbacks();
