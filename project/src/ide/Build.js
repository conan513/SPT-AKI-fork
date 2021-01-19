/* build.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const vfs = require("../utils/VFS.js");
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
        "icon": "assets/res/icon.ico",
        "entry": "src/ide/BuildEntry.js"
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
    }

    static preBuild()
    {
        if (vfs.exists(Compiler.buildOptions.build.dir))
        {
            console.log("Old build detected, removing the file");
            vfs.removeDir(Compiler.buildOptions.build.dir);
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
        if (vfs.exists(Compiler.buildOptions.tmp.dir))
        {
            // TODO: delete files recurive
            vfs.removeDir(Compiler.buildOptions.tmp.dir);
        }
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
