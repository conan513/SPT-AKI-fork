"use strict";

require("../Lib.js");

class CertCallbacks
{
    static load()
    {
        CertController.load();
    }

    static registerBinary(url, info, sessionID)
    {
        return "CERT_BIN";
    }

    static sendBinary(sessionID, req, resp, body)
    {
        const certs = CertController.getCerts();
        const isAttachment = true;
        const sendType = isAttachment ? "attachment" : "inline";

        resp.writeHead(200, "OK",         {
            "Content-Type": HttpServer.mime["bin"],
            "Content-Disposition": `${sendType}; filename=cert.pem`
        });

        resp.end(certs.cert);
    }
}

module.exports = CertCallbacks;