/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const fs = require("fs");

class Callbacks
{
    constructor()
    {
        https_f.router.onStaticRoute["/certs/get"] = this.getCertBinary.bind(this);
        https_f.server.onRespond["BIN"] = this.sendBinary.bind(this);
    }

    getCertBinary(url, info, sessionID)
    {
        return "BIN";
    }

    sendBinary(sessionID, req, resp, body)
    {
        const certs = https_f.server.generateCertificate();
        resp.writeHead(200, "OK",         {
            "Content-Type": https_f.server.mime["bin"],
            "Content-Disposition": "attachment; filename=\"cert.pem\""
        });
        resp.end(certs.cert);
    }
}

module.exports.Callbacks = Callbacks;