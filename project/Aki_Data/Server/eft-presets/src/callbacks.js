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
        core_f.packager.onLoad["loadPresets"] = this.load.bind(this);
    }

    load()
    {
        preset_f.controller.initialize();
    }
}

module.exports.Callbacks = Callbacks;
