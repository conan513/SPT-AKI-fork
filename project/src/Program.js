/* Program.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const process = require("process");
const watermark = require("./utils/Watermark");
const App = require("./utils/App");

class Program
{
    static main()
    {
        // set window properties
        process.stdout.setEncoding("utf8");
        process.title = "SPT-AKI Server";

        // show watermark
        watermark.setTitle();
        watermark.resetCursor();
        watermark.draw();

        // import classes
        require("./Lib");

        // load and execute all packages
        App.load();
    }
}

Program.main();
