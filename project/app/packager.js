/* packager.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const fs = require("fs");

class Packager
{
    constructor()
    {
        this.basepath = "Aki_Data/Server/";
        this.source = {};
        this.onLoad = {};
    }

    importClass(name, filepath)
    {
        // import class
        global[name] = require(`../${filepath}`);
    }

    load()
    {
        const source = JSON.parse(fs.readFileSync(`${this.basepath}loadorder.json`));

        // import classes
        for (const pkg in source)
        {
            this.importClass(pkg, `${this.basepath}${source[pkg]}`);
        }

        // execute onLoad callbacks
        console.log("Server: executing startup callbacks...");

        for (const callback in this.onLoad)
        {
            this.onLoad[callback]();
        }
    }
}

module.exports.packager = new Packager();
