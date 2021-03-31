/* build.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const VFS = require("../utils/VFS");
const { compile } = require("nexe");
const resourceHacker = require('@lorki97/node-resourcehacker');

require("./CheckVersion.js");

class Compiler
{
    static buildOptions = {
        "tmp": {
            "dir": "build/out/",
            "exe": "Server-Tmp.exe"
        },
        "build": {
            "dir": "build/",
            "exe": "Server.exe"
        },
        "icon": "assets/images/icon.ico",
        "entry": "src/ide/ReleaseEntry.js"
    };
    static nexeOptions = {
        "input": Compiler.buildOptions.entry,
        "output": `${Compiler.buildOptions.tmp.dir}${Compiler.buildOptions.tmp.exe}`,
        "build": false
    };
    static resourceHackerOptions = {
        "operation": "addoverwrite",
        "input": `${Compiler.buildOptions.tmp.dir}${Compiler.buildOptions.tmp.exe}`,
        "output": `${Compiler.buildOptions.build.dir}${Compiler.buildOptions.build.exe}`,
        "resource": Compiler.buildOptions.icon,
        "resourceType": "ICONGROUP",
        "resourceName": "MAINICON",
    };

    static preBuild()
    {
        if (VFS.exists(Compiler.buildOptions.build.dir))
        {
            console.log("Old build detected, removing the file");
            VFS.removeDir(Compiler.buildOptions.build.dir);
        }
    }

    static nexeCompile()
    {
        return compile(Compiler.nexeOptions);
    }

    static replaceIcon(callback)
    {
        resourceHacker(Compiler.resourceHackerOptions, callback);
    }

    static postBuild()
    {
        if (VFS.exists(Compiler.buildOptions.tmp.dir))
        {
            VFS.removeDir(Compiler.buildOptions.tmp.dir);
        }

        VFS.copyDir("assets/", `${Compiler.buildOptions.build.dir}Aki_Data/Server/`);
    }

    static run()
    {
        // todo: find a solution that's not this
        // I fucking hate promises and callbacks like this
        Compiler.preBuild();
        Compiler.nexeCompile().then(() =>
        {
            Compiler.replaceIcon(Compiler.postBuild)
        });
    }
}

Compiler.run();
