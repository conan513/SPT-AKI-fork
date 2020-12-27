/* config.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Config
{
    constructor()
    {
        this.saveOnReceive = false;
        this.saveOnExit = true;
        this.saveIntervalSec = 30;
        this.filepath = "user/profiles/";
    }
}

module.exports.Config = Config;
