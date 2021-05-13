const { compile } = require("nexe");
const rcedit = require("rcedit");
const VFS = require("../utils/VFS.js");

require("./CheckVersion.js");

class Compiler
{
    static buildOptions = {
        "tmp": {
            "dir": "obj/",
            "exe": "Server-Tmp.exe"
        },
        "build": {
            "dir": "build/",
            "exe": "Server.exe"
        },
        "icon": "assets/images/icon.ico",
        "entry": "obj/ide/ReleaseEntry.js"
    };
    static nexeOptions = {
        "input": Compiler.buildOptions.entry,
        "output": `${Compiler.buildOptions.tmp.dir}${Compiler.buildOptions.tmp.exe}`,
        "build": false
    };
    static rceditOptions = {
        "icon": Compiler.buildOptions.icon
    };

    static preBuild()
    {
        if (VFS.exists(Compiler.buildOptions.build.dir))
        {
            console.log("Old build detected, removing the file");
            VFS.removeDir(Compiler.buildOptions.build.dir);
        }
    }

    static exeCompile()
    {
        return compile(Compiler.nexeOptions);
    }

    static replaceIcon()
    {
        console.log("Editing icon...");
        const exePath = `${Compiler.buildOptions.tmp.dir}${Compiler.buildOptions.tmp.exe}`;
        return rcedit(exePath, Compiler.rceditOptions);
    }

    static postBuild()
    {
        VFS.copyFile(`${Compiler.buildOptions.tmp.dir}${Compiler.buildOptions.tmp.exe}`,
                     `${Compiler.buildOptions.build.dir}${Compiler.buildOptions.build.exe}`);

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
        Compiler.exeCompile().then(() =>
        {
            Compiler.replaceIcon().then(() =>
            {
                Compiler.postBuild();
            })
        });
    }
}

Compiler.run();
