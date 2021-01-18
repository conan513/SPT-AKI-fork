/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { ItemEventRouter } = require("./src/ItemEventRouter.js");
const { ItemEventCallbacks } = require("./src/ItemEventCallbacks.js");

module.exports.eventHandler = new ItemEventRouter();
module.exports.callbacks = new ItemEventCallbacks();
