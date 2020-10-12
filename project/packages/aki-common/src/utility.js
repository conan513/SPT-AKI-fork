/* common_f.utility.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Terkoiz
 * - PoloYolo
 */

"use strict";

const crypto = require("crypto");

class Utility
{
    clearString(s)
    {
        return s.replace(/[\b]/g, "")
            .replace(/[\f]/g, "")
            .replace(/[\n]/g, "")
            .replace(/[\r]/g, "")
            .replace(/[\t]/g, "")
            .replace(/[\\]/g, "");
    }

    generateID()
    {
        const shasum = crypto.createHash("sha1");
        const time = Math.random() * this.getTimestamp();

        shasum.update(time.toString());
        return shasum.digest("hex").substring(0, 24);
    }
}

module.exports.Utility = Utility;
