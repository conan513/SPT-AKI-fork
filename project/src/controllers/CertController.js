/* CertController.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 * - Emperor06
 * - Terkoiz
 */

"use strict";

const selfsigned = require("selfsigned");
const sudo = require("sudo-prompt");

class CertController
{
    constructor()
    {
        this.certDir = "user/certs/";
        this.certFile = `${this.certDir}cert.pem`;
        this.keyFile = `${this.certDir}key.pem`;
        this.fingerprint = "";
        this.certs = {};
    }

    load()
    {
        this.getCerts();
    }

    getCerts()
    {
        if (Object.keys(this.certs).length < 2)
        {
            // load certs
            this.certs = this.readCerts();

            if (Object.keys(this.certs).length < 2)
            {
                // no certs exist
                this.generateCertificates();
            }
        }

        return this.certs;
    }

    readCerts()
    {
        if (!vfs.exists(this.certDir))
        {
            vfs.createDir(this.certDir);
        }

        if (vfs.exists(this.certFile) && vfs.exists(this.keyFile))
        {
            try
            {
                const cert = vfs.readFile(this.certFile);
                const key = vfs.readFile(this.keyFile);
                return { "cert": cert, "key": key };
            }
            catch (e)
            {
                return {};
            }
        }

        return {};
    }

    generateCertificates()
    {
        let cert;
        let key;
        let fingerprint;

        ({ cert, "private": key, fingerprint } = selfsigned.generate([{ "name": "commonName", "value": https_f.config.ip }], { "days": 365 }));
        vfs.writeFile(this.certFile, cert);
        vfs.writeFile(this.keyFile, key);
        Logger.info(`Generated self-signed x509 certificate ${fingerprint}`);

        if (process.platform === "linux")
        {
            Logger.info("You are running on linux, you will have to install the cert manually.");
            Logger.info(`copy ${this.certFile} to your windows PC and run \n\t  certutil.exe -f -addstore Root <path to cert.pem>`);
            Logger.info(`Cert can also be downloaded from ${https_f.server.getBackendUrl()}${certs_f.callbacks.endPoint}`);

        }
        else
        {
            Logger.info("Installing cert in trust store. You will be asked for admin privileges.");

            // Use CERTMGR.MSC to remove this Trust Store Certificate manually
            sudo.exec(`certutil.exe -f -addstore Root ${this.certFile}`, {
                name: "Server"
            }, (error, stdout, stderr) =>
            {
                if (error) throw error;
            });

            Logger.info("Added self-signed x509 certificate");
        }

        this.fingerprint = fingerprint;
        this.certs = { "cert": cert, "key": key };
    }
}

module.exports = new CertController();
