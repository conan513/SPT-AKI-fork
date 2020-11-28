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
        core_f.packager.onLoad["loadAdditions"]  = this.load.bind(this);
    }

    load()
    {
        additions_f.controller.load();
    }
}

module.exports.Callbacks = Callbacks;
