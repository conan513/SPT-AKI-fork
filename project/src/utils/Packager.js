/* packager.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Packager
{
    onLoad: {};
    onUpdate: {};
    onUpdateLastRun: {};
    
    constructor()
    {
        this.onLoad = {};
        this.onUpdate = {};
        this.onUpdateLastRun = {};
    }

    load()
    {
        // execute onLoad callbacks
        console.log("Server: executing startup callbacks...");

        for (const callback in this.onLoad)
        {
            this.onLoad[callback]();
        }

        setInterval(this.update.bind(this), 1000);
    }

    update()
    {
        for (const taskId in this.onUpdate)
        {
            let success,
                lastruntime = 0;
            if (this.onUpdateLastRun[taskId] !== undefined)
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

module.exports = new Packager();
