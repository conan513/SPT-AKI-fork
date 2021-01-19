/* main.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const process = require("process");
const watermark = require("./utils/Watermark.js");

// set window properties
process.stdout.setEncoding("utf8");
process.title = "SPT-AKI Server";

// show watermark
watermark.instance.setTitle();
watermark.instance.resetCursor();
watermark.instance.draw();

// import classes
require("./Lib.js");

// load and execute all packages
core_f.packager.load();
