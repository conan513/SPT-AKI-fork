/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class CertCallbacks
{
    constructor()
    {
        this.endPoint = "/certs/get";
        this.certFilename = "cert.pem";
        this.isAttachment = true;
    }

    load()
    {
        certs_f.controller.load();
    }

    registerBinary(url, info, sessionID)
    {
        return "CERT_BIN";
    }

    sendBinary(sessionID, req, resp, body)
    {
        const certs = certs_f.controller.getCerts();
        let sendType = this.isAttachment ? "attachment" : "inline";

        resp.writeHead(200, "OK",         {
            "Content-Type": https_f.server.mime["bin"],
            "Content-Disposition": `${sendType}; filename="${this.certFilename}"`
        });

        resp.end(certs.cert);
    }
}

module.exports = new CertCallbacks();