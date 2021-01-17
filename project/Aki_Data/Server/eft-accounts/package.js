/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const { AccountController } = require("./src/controller.js");
const { AccountCallbacks } = require("./src/callbacks.js");

module.exports.controller = new AccountController();
module.exports.callbacks = new AccountCallbacks();
