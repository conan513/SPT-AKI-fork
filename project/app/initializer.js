/* initializer.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Initializer
{
    constructor()
    {
        process.title = "SPT-AKI Server";

        this.initializeCore();
    }

    // load core functionality
    initializeCore()
    {
        // setup core files
        global.db = {};
        global.res = {};
        global.src = {};

        // setup utilites
        global.utility = require("./util/utility.js");
        
        // get packages to load
        global["packager_f"] = require("./packager.js");
        packager_f.instance.all();
    }
}

module.exports.initializer = new Initializer();