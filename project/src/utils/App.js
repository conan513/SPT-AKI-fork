/* packager.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const Logger = require("./Logger");
const TimeUtil = require("./TimeUtil");

class App
{
    static onLoad = require("../bindings/AppLoad");
    static onUpdate = require("../bindings/AppUpdate");
    static onUpdateLastRun = {};

    static load()
    {
        // execute onLoad callbacks
        console.log("Server: executing startup callbacks...");

        for (const callback in App.onLoad)
        {
            App.onLoad[callback]();
        }

        setInterval(App.update, 1000);
    }

    static update()
    {
        for (const taskId in App.onUpdate)
        {
            let success = false;
            let lastruntime = App.onUpdateLastRun[taskId] || 0;

            const timeSinceLastRun = TimeUtil.getTimestamp() - lastruntime;

            try
            {
                success = App.onUpdate[taskId](timeSinceLastRun);
            }
            catch (err)
            {
                Logger.error(`Scheduled event: '${taskId}' failed to run successfully.`);
                console.log(err);
            }

            if (success)
            {
                App.onUpdateLastRun[taskId] = TimeUtil.getTimestamp();
            }
            else
            {
                /* temporary for debug */
                const warnTime = 20 * 60;

                if (success === void 0 && !(timeSinceLastRun % warnTime))
                {
                    Logger.info(`onUpdate: ${taskId} doesn't report success or fail`);
                }
            }
        }
    }
}

module.exports = App;
