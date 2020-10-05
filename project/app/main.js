/* main.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

/* show name in window */
process.stdout.setEncoding("utf8");

/* load server components */
require("./initializer.js");
const watermark = require("./server/watermark.js");
watermark.instance.setTitle();
watermark.instance.resetCursor();
watermark.instance.draw();

server.start();
