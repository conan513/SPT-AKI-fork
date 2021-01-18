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
        this.certs = "";
    }

    load()
    {
        this.getCerts();
    }

    getCerts()
    {
        if (!this.certs)
        {
            this.certs = this.readCerts();
            if (!this.certs)
            {
                this.generateCertificates();
            }
        }
        return this.certs;
    }

    readCerts()
    {
        if (common_f.vfs.exists(this.certFile) && common_f.vfs.exists(this.keyFile))
        {
            try
            {
                const cert = common_f.vfs.readFile(this.certFile);
                const key = common_f.vfs.readFile(this.keyFile);
                return {cert: cert, key: key };
            }
            catch (e)
            {
                return false;
            }
        }
        else
        {
            if (!common_f.vfs.exists(this.certDir))
            {
                common_f.vfs.createDir(this.certDir);
            }
        }
        return false;
    }

    generateCertificates()
    {

        let cert;
        let key;
        let fingerprint;

        ({ cert, private: key, fingerprint } = selfsigned.generate([{ name: "commonName", value: https_f.config.ip }], { days: 365 }));


        common_f.logger.logInfo(`Generated self-signed x509 certificate ${fingerprint}`);

        common_f.vfs.writeFile(this.certFile, cert);
        common_f.vfs.writeFile(this.keyFile, key);

        if (process.platform === "linux")
        {
            common_f.logger.logInfo("You are running on linux, you will have to install the cert manually.");
            common_f.logger.logInfo(`copy ${this.certFile} to your windows PC and run \n\t  certutil.exe -f -addstore Root <path to cert.pem>`);
            common_f.logger.logInfo(`Cert can also be downloaded from ${https_f.config.backendUrl}${certs_f.callbacks.endPoint}`);

        }
        else
        {
            common_f.logger.logInfo("Installing cert in trust store. You will be asked for admin privileges.");
            // Use CERTMGR.MSC to remove this Trust Store Certificate manually
            sudo.exec(`certutil.exe -f -addstore Root ${this.certFile}`, {
                name: "Server"
            }, (error, stdout, stderr) =>
            {
                if (error) throw error;
            });
            common_f.logger.logInfo("Added OK.");
        }

        this.fingerprint = fingerprint;
        this.certs = { cert: cert, key: key };
    }
}

module.exports = new CertController();
