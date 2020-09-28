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

    /* load core functionality */
    initializeCore()
    {
        /* setup utilites */
        global.utility = require("./util/utility.js");
        global.logger = (require("./util/logger.js").logger);
        global.json = require("./util/json.js");

        /* setup core files */
        global.db = {};
        global.res = {};
        global.src = {};

        /* setup routes and cache */
        const route = require("./server/route.js");
        route.all();

        /* core logic */
        global.router = (require("./server/router.js").router);
        global.events = require("./server/events.js");
        global.server = (require("./server/server.js").server);
        global.watermark = require("./server/watermark.js");
    }

    /* load exception handler */
    initializeExceptions()
    {
        process.on("uncaughtException", (error, promise) =>
        {
            logger.logError("Server:" + server.getVersion());
            logger.logError("Trace:");
            logger.logData(error);
        });
    }

    /* load classes */
    initializeClasses()
    {
        logger.logWarning("Interpreter: loading classes...");

        for (let name in src)
        {
            global[name] = require("../" + src[name]);
        }

        logger.logSuccess("Interpreter: loaded classes");
    }
}

module.exports.initializer = new Initializer();