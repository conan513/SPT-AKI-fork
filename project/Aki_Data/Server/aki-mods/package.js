/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { ModLoader } = require("./src/ModLoader.js");
const { ModCallbacks } = require("./src/ModCallbacks.js");

module.exports.loader = new ModLoader();
module.exports.callbacks = new ModCallbacks();
