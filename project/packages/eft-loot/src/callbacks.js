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
        core_f.packager.onLoad["loadLoot"] = this.load.bind(this);
    }

    load()
    {
        loot_f.controller.initialize();
    }
}

module.exports.Callbacks = Callbacks;
