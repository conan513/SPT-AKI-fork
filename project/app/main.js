/* main.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

// force packing of selfsigned
require("selfsigned");

process.stdout.setEncoding("utf8");

require("./initializer.js");
https_f.server.start();
