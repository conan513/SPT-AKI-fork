/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { Router } = require("./src/router.js");
const { Callbacks } = require("./src/callbacks.js");

module.exports.router = new Router();
module.exports.callbacks = new Callbacks();
