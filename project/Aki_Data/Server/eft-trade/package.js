/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { TradeController } = require("./src/controller.js");
const { TradeCallbacks } = require("./src/callbacks.js");

module.exports.controller = new TradeController();
module.exports.callbacks = new TradeCallbacks();
