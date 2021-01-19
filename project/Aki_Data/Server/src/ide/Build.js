/* build.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const fs = require("fs");
const { compile } = require("nexe");
const resourceHacker = require('@lorki97/node-resourcehacker');

require("./CheckVersion.js");

class Compiler
{
    static buildOptions = {
        "output": "Server.exe",
        "temp": "Server-Temp.exe"
    };
    static nexeOptions = {
        "input": "Aki_Data/Server/src/ide/BuildEntry.js",
        "output": Compiler.buildOptions.temp,
        "build": false
    };
    static resourceHackerOptions = {
        "operation": "addoverwrite",
        "input": Compiler.buildOptions.temp,
        "output": Compiler.buildOptions.output,
        "resource": "Aki_Data/Server/res/icon.ico",
        "resourceType": "ICONGROUP",
        "resourceName": "MAINICON",
    }

    static preBuild()
    {
        if (fs.existsSync(Compiler.buildOptions.output))
        {
            console.log("Old build detected, removing the file");
            fs.unlinkSync(Compiler.buildOptions.output);
        }
    }

    static nexeCompile()
    {
        console.log("Compiling...");
        return compile(Compiler.nexeOptions);
    }

    static replaceIcon(callback)
    {
        console.log("Changing icon...");
        return resourceHacker(Compiler.resourceHackerOptions, callback);
    }

    static postBuild()
    {
        if (fs.existsSync(Compiler.buildOptions.temp))
        {
            fs.unlinkSync(Compiler.buildOptions.temp);
        }
    }

    static run()
    {
        // todo: find a solution that's not this
        // I fucking hate promises and callbacks like this
        Compiler.preBuild();
        Compiler.nexeCompile().then(Compiler.replaceIcon(Compiler.postBuild));
    }
}

Compiler.run();
