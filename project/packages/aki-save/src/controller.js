/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Controller
{
    load()
    {
        if (save_f.config.saveOnExit)
        {
            process.on("exit", (code) =>
            {
                this.onSave();
            });

            process.on("SIGINT", (code) =>
            {
                // linux ctrl-c
                this.onSave();
                process.exit(1);
            });
        }

        if (save_f.config.saveIntervalSec > 0)
        {
            setInterval(() =>
            {
                this.onSave();
            }, save_f.config.saveIntervalSec * 1000);
        }
    }

    onSave()
    {
        save_f.server.save();
        common_f.logger.logSuccess("Saved profiles");
    }
}

module.exports.Controller = Controller;
