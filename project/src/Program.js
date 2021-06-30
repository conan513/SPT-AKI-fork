"use strict";

require("./Lib.js");

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
        watermark.initialize();
        watermark.setTitle();
        watermark.resetCursor();
        watermark.draw();

        // easter egg
        Logger.write("");
        Logger.write("Thanks Kiryu Coco for all the fun times and memories!");
        Logger.write("This release will be dedicated to you.");
        Logger.write("- Senko-san");
        Logger.write("");

        // load and execute all packages
        App.load();
    }
}

Program.main();
