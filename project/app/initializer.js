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
        this.initializeExceptions();
        this.initializeClasses();
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
        global.logger = (require("./util/logger.js").logger);
        
        // get packages to load
        global["packager_f"] = require("./packager.js");
        packager_f.instance.all();
    }

    // load exception handler
    initializeExceptions()
    {
        process.on("uncaughtException", (error, promise) =>
        {
            logger.logError("Trace:");
            logger.log(error);
        });
    }

    // load classes
    initializeClasses()
    {
        logger.logWarning("Interpreter: loading classes...");

        for (let name in src)
        {
            global[name] = require(`../${src[name]}`);
        }

        logger.logSuccess("Interpreter: loaded classes");
    }
}

module.exports.initializer = new Initializer();