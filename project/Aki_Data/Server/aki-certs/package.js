/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { CertController } = require("./src/CertController.js");
const { CertCallbacks } = require("./src/CertCallbacks");

module.exports.controller = new CertController();
module.exports.callbacks = new CertCallbacks();
