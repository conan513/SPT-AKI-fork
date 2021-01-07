/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { Loader } = require("./src/loader.js");
const { Callbacks } = require("./src/callbacks.js");

module.exports.loader = new Loader();
module.exports.callbacks = new Callbacks();
