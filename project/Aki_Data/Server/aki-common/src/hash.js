/* common_f.hash.js
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

class HashUtil
{
    /**
   *
   *
   * @return {string}
   * @memberof HashUtil
   */
    generate()
    {
        const shasum = crypto.createHash("sha1");
        const time = Math.random() * common_f.time.getTimestamp();

        shasum.update(time.toString());
        return shasum.digest("hex").substring(0, 24);
    }
}

module.exports.HashUtil = HashUtil;
