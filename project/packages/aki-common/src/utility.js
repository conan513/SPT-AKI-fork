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

    formatTime(date)
    {
        const hours = `0${date.getHours()}`.substr(-2);
        const minutes = `0${date.getMinutes()}`.substr(-2);
        const seconds = `0${date.getSeconds()}`.substr(-2);
        return `${hours}-${minutes}-${seconds}`;
    }

    formatDate(date)
    {
        const day = `0${date.getDate()}`.substr(-2);
        const month = `0${date.getMonth() + 1}`.substr(-2);
        return `${date.getFullYear()}-${month}-${day}`;
    }

    getDate()
    {
        return this.formatDate(new Date());
    }

    getTime()
    {
        return this.formatTime(new Date());
    }

    getTimestamp()
    {
        return Math.floor(new Date() / 1000);
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
