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
        this.staticLib = "lib.js";
        this.source = {};
        this.onLoad = {};
        this.onUpdate = {};
        this.onUpdateLastRun = {};
        this.enableStaticLib = true;
    }

    importClass(name, filepath)
    {
        // import class
        global[name] = require(`../${filepath}`);
    }

    loadPackageList()
    {
        return JSON.parse(fs.readFileSync(`${this.basepath}loadorder.json`));
    }

    /**
     * Created Static Library for linking
     * @param {string} [file]
     */
    createStaticLib(file)
    {
        const packageList = this.loadPackageList();
        let output = "";
        for (const pkg in packageList)
        {
            output += `globalThis.${pkg} = require("./${this.basepath}${packageList[pkg]}");\n`;
        }
        fs.writeFileSync(this.staticLib, output);
        return true;
    }

    load()
    {
        if (this.enableStaticLib)
        {
            this.staticLoader();
        }
        else
        {
            this.dynamicLoader();
        }

        // execute onLoad callbacks
        console.log("Server: executing startup callbacks...");

        for (const callback in this.onLoad)
        {
            this.onLoad[callback]();
        }

        setInterval(this.update.bind(this), 1000);
    }

    dynamicLoader()
    {
        const source = this.loadPackageList();

        // import classes
        for (const pkg in source)
        {
            this.importClass(pkg, `${this.basepath}${source[pkg]}`);
        }
    }

    staticLoader ()
    {
        if (!fs.existsSync(this.staticLib))
        {
            this.createStaticLib();


        }
        require("../" + this.staticLib);
    }

    update()
    {
        for (const taskId in this.onUpdate)
        {
            let success,
                lastruntime = 0;
            if (this.onUpdateLastRun[taskId] !== void 0)
            {
                lastruntime = this.onUpdateLastRun[taskId];
            }

            const timeSinceLastRun = common_f.time.getTimestamp() - lastruntime;

            try
            {
                success = this.onUpdate[taskId](timeSinceLastRun);
            }
            catch (err)
            {
                common_f.logger.logError(`Scheduled event: '${taskId}' failed to run successfully.`);
                console.log(err);
                success = false;
            }

            if (success)
            {
                this.onUpdateLastRun[taskId] = common_f.time.getTimestamp();
            }
            else
            {
                /* temporary for debug */
                const warnTime = 20 * 60;
                if (success === void 0 && !(timeSinceLastRun % warnTime))
                {
                    common_f.logger.logInfo(`onUpdate: ${taskId} doesn't report success or fail`);
                }
            }
        }
    }
}

module.exports.packager = new Packager();
