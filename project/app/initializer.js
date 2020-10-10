/* initializer.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const watermark = require("./watermark.js");

class Initializer
{
    constructor()
    {
        process.title = "SPT-AKI Server";

        this.initializeCore();
        this.initializeWatermark();
    }

    // load core functionality
    initializeCore()
    {
        global.db = {};
        global.res = {};
        global.src = {};

        // get packages to load
        global["packager_f"] = require("./packager.js");
        packager_f.instance.all();
    }

    initializeWatermark()
    {
        watermark.instance.setTitle();
        watermark.instance.resetCursor();
        watermark.instance.draw();
    }
}

module.exports.initializer = new Initializer();