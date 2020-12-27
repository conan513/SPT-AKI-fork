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
        core_f.packager.onLoad["aki-https"] = this.load.bind(this);
    }

    load()
    {
        https_f.server.load();
    }
}

module.exports.Callbacks = Callbacks;
