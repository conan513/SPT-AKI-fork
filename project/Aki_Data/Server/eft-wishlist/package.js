/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { WishlistController } = require("./src/WishlistController.js");
const { WishlistCallbacks } = require("./src/WishlistCallbacks.js");

module.exports.controller = new WishlistController();
module.exports.callbacks = new WishlistCallbacks();
