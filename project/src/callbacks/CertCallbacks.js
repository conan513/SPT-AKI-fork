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
    static load()
    {
        certs_f.controller.load();
    }

    static registerBinary(url, info, sessionID)
    {
        return "CERT_BIN";
    }

    static sendBinary(sessionID, req, resp, body)
    {
        const certs = certs_f.controller.getCerts();
        const isAttachment = true;
        const sendType = isAttachment ? "attachment" : "inline";

        resp.writeHead(200, "OK",         {
            "Content-Type": https_f.server.mime["bin"],
            "Content-Disposition": `${sendType}; filename=cert.pem`
        });

        resp.end(certs.cert);
    }
}

module.exports = CertCallbacks;