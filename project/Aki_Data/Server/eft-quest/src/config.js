/* config.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Config
{
    constructor()
    {
        this.redeemTime = 48;
        /* changing these will require a wipe */
        this.status = {
            Locked: 0,
            AvailableForStart: 1,
            Started: 2,
            AvailableForFinish: 3,
            Success: 4,
            Fail: 5,
            FailRestartable: 6,
            MarkedAsFailed: 7
        };
    }
}

module.exports.Config = Config;
