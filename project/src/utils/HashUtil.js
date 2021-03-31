/* HashUtil.js
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
const TimeUtil = require("./TimeUtil");

class HashUtil
{
    generate()
    {
        const shasum = crypto.createHash("sha1");
        const time = Math.random() * TimeUtil.getTimestamp();

        shasum.update(time.toString());
        return shasum.digest("hex").substring(0, 24);
    }
}

module.exports = new HashUtil();
