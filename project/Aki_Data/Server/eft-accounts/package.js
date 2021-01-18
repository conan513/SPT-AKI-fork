/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const { LauncherController } = require("./src/LauncherController.js");
const { LauncherCallbacks } = require("./src/LauncherCallbacks.js");

module.exports.controller = new LauncherController();
module.exports.callbacks = new LauncherCallbacks();
