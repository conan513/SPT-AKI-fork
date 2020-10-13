/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

class Callbacks
{
    constructor()
    {
        https_f.server.onStart["loadPresets"] = this.load.bind(this);
    }

    load()
    {
        preset_f.controller.initialize();
    }
}

module.exports.Callbacks = Callbacks;
