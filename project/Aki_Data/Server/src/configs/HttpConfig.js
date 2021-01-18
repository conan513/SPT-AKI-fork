/* HttpConfig.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class HttpConfig
{
    constructor()
    {
        this.name = "Local SPT-AKI Server";
        this.ip = "127.0.0.1";
        this.port = 443;
        this.backendUrl = `https://${this.ip}:${this.port}`;
        this.websocketUrl = `wss://${this.ip}:${this.port}`;
    }
}

module.exports = new HttpConfig();
