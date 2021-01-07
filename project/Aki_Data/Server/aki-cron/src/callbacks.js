/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Callbacks
{
    constructor()
    {

        this.tasks = {};
        this.baseInterval = 10 * 1000;
        this.lastruntime = {};
        this.timer = null;
        core_f.packager.onLoad["aki-cron"] = this.load.bind(this);


    }

    load()
    {
        this.timer = setInterval((a) =>
        {
            this.executeCronTasks(this);
        }, this.baseInterval);
    }

    executeCronTasks()
    {
        for (const taskId in this.tasks)
        {
            let success = false;
            let lastruntime = 0;
            if (this.lastruntime[taskId] !== void 0)
            {
                lastruntime = this.lastruntime[taskId];
            }

            try
            {
                success = this.tasks[taskId](lastruntime);
            }
            catch (err)
            {
                console.log(`Scheduled event: '${taskId}' failed to run successfully.`);
                console.log(err);
                success = false;
            }

            if (success)
            {
                this.lastruntime[taskId] = common_f.time.getTimestamp();
            }
        }
    }

    add(taskId, task)
    {
        if (!this.tasks[taskId])
        {
            this.tasks[taskId] = task;
            return true;
        }
        return false;
    }

    /* todo: test */
    remove(taskId)
    {
        if (this.tasks[taskId])
        {
            this.tasks.splice(taskId, 1);
        }
    }
}

module.exports.Callbacks = Callbacks;
