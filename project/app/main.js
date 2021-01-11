/* main.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const process = require("process");
const watermark = require("./watermark.js");

// force packing of npm packages
require("selfsigned");
require("sudo-prompt");
require("ws");

// set window properties
process.stdout.setEncoding("utf8");
process.title = "SPT-AKI Server";

// show watermark
watermark.instance.setTitle();
watermark.instance.resetCursor();
watermark.instance.draw();

// load and execute all packages
global["core_f"] = require("./packager.js");
core_f.packager.load();
