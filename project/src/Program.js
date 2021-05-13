"use strict";

require("./Lib.js");

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

        // enable exception logging
        Logger.initialize();

        // show watermark
        watermark.setTitle();
        watermark.resetCursor();
        watermark.draw();

        // easter egg
        Logger.write("");
        Logger.write("Thanks everyone for enjoying our work and for your amazing support thorough the years!");
        Logger.write("We couldn't have done it without you.");
        Logger.write("- Senko-san");
        Logger.write("");

        // load and execute all packages
        App.load();
    }
}

Program.main();
