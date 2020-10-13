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
    constructor()
    {
        this.onExec = {};
    }

    execute(sessionID)
    {
        if (!account_f.controller.isWiped(sessionID))
        {
            for (const callback in this.onExec)
            {
                this.onExec[callback](sessionID);
            }
        }
    }
}

module.exports.Controller = Controller;
