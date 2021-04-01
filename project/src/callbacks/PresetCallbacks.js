/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

const PresetController = require("../controllers/PresetController.js");

class PresetCallbacks
{
    static load()
    {
        PresetController.initialize();
    }
}

module.exports = PresetCallbacks;
