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
        this.onExecute = {};
    }

    execute(sessionID)
    {
        if (!account_f.controller.isWiped(sessionID))
        {
            for (const callback in this.onExecute)
            {
                this.onExecute[callback](sessionID);
            }
        }
    }
}

module.exports.Controller = Controller;
