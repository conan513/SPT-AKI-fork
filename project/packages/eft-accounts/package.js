/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const { Server } = require("./src/server.js");
const { Callbacks } = require("./src/callbacks.js");

module.exports.server = new Server();
module.exports.callbacks = new Callbacks();
