"use strict";

require("../Lib.js");

const selfsigned = require("selfsigned");
const sudo = require("sudo-prompt");

class CertController
{
    static certDir = "user/certs/";
    static certFile = `${CertController.certDir}cert.pem`;
    static keyFile = `${CertController.certDir}key.pem`;
    static fingerprint = "";
    static certs = {};

    static load()
    {
        CertController.getCerts();
    }

    static getCerts()
    {
        if (Object.keys(CertController.certs).length < 2)
        {
            // load certs
            CertController.certs = CertController.readCerts();

            if (Object.keys(CertController.certs).length < 2)
            {
                // no certs exist
                CertController.generateCertificates();
            }
        }

        return CertController.certs;
    }

    static readCerts()
    {
        if (!VFS.exists(CertController.certDir))
        {
            VFS.createDir(CertController.certDir);
        }

        if (VFS.exists(CertController.certFile) && VFS.exists(CertController.keyFile))
        {
            try
            {
                const cert = VFS.readFile(CertController.certFile);
                const key = VFS.readFile(CertController.keyFile);
                return { "cert": cert, "key": key };
            }
            catch (e)
            {
                return {};
            }
        }

        return {};
    }

    static generateCertificates()
    {
        let cert;
        let key;
        let fingerprint;

        ({ cert, "private": key, fingerprint } = selfsigned.generate([{ "name": "commonName", "value": HttpConfig.ip }], { "days": 365 }));
        VFS.writeFile(CertController.certFile, cert);
        VFS.writeFile(CertController.keyFile, key);
        Logger.info(`Generated self-signed x509 certificate ${fingerprint}`);

        if (process.platform === "linux")
        {
            Logger.info("You are running on linux, you will have to install the cert manually.");
            Logger.info(`copy ${CertController.certFile} to your windows PC and run \n\t  certutil.exe -f -addstore Root <path to cert.pem>`);
            Logger.info(`Cert can also be downloaded from ${HttpServer.getBackendUrl()}${certs_f.callbacks.endPoint}`);

        }
        else
        {
            Logger.info("Installing cert in trust store. You will be asked for admin privileges.");

            // Use CERTMGR.MSC to remove this Trust Store Certificate manually
            sudo.exec(`certutil.exe -f -addstore Root ${CertController.certFile}`, {
                name: "Server"
            }, (error, stdout, stderr) =>
            {
                if (error)
                {
                    Logger.log("------------------------------------------------------------------------------------------");
                    Logger.error("Certificate installation failed. You will most likely run into issues in-game!");
                    Logger.error("Please run the following command in cmd with admin privileges:");
                    Logger.log(`certutil.exe -f -addstore Root "${process.cwd()}\\${CertController.certFile.replace(/\//g, "\\")}"`);
                    Logger.log("------------------------------------------------------------------------------------------");
                    throw error;
                }
            });

            Logger.info("Added self-signed x509 certificate");
        }

        CertController.fingerprint = fingerprint;
        CertController.certs = {
            "cert": cert,
            "key": key
        };
    }
}

module.exports = CertController;
