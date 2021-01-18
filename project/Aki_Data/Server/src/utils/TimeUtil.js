/* common_f.time.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class TimeUtil
{
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
}

module.exports = TimeUtil;
