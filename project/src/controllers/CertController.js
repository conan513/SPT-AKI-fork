"use strict";

require("../Lib.js");

const forge = require("node-forge");
const os = require("os");
const Shell = require("node-powershell");

class CertController
{
    static certDir = "user/certs/";
    static certFile = `${CertController.certDir}cert.pem`;
    static keyFile = `${CertController.certDir}key.pem`;
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

                if (forge.pki.certificateFromPem(cert).validity.notAfter < Date.now)
                {
                    Logger.info("Certificate has expired");
                    return {};
                }

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
        const keys = forge.pki.rsa.generateKeyPair(2048);
        const cert = forge.pki.createCertificate();
        const attrs = [
            { "name": "commonName", "value": HttpConfig.ip },
            { "name": "organizationName", "value": "SPT-AKI" },
        ];

        cert.publicKey = keys.publicKey;
        cert.validity.notBefore = new Date();
        cert.validity.notAfter = new Date();
        cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 10);
        cert.setSubject(attrs);
        cert.setIssuer(attrs);

        cert.setExtensions([
            {
                "name": "subjectAltName",
                "altNames": [
                    {
                        "type": 2, // DNS
                        "value": "localhost"
                    },
                    {
                        "type": 7, // IP
                        "ip": HttpConfig.ip
                    }
                ]
            },
            {
                "name": "subjectKeyIdentifier"
            }
        ]);

        cert.sign(keys.privateKey, forge.md.sha256.create());

        VFS.writeFile(CertController.certFile, forge.pki.certificateToPem(cert));
        VFS.writeFile(CertController.keyFile, forge.pki.privateKeyToPem(keys.privateKey));
        Logger.info(`Generated self-signed x509 certificate ${forge.pki.getPublicKeyFingerprint(cert.publicKey, { "encoding": "hex", "delimiter": ":" })}`);

        if (os.platform() === "linux")
        {
            Logger.info("You are running on linux, you will have to install the cert manually.");
            Logger.info(`copy ${CertController.certFile} to your windows PC and run \n\t  certutil.exe -f -addstore Root <path to cert.pem>`);
            Logger.info(`Cert can also be downloaded from ${HttpServer.getBackendUrl()}$/certs/get`);
        }
        else if (os.platform() === "win32" && os.type().startsWith("Windows") && os.release().startsWith("10"))
        {
            Logger.info("Installing cert in trust store. You will be asked for admin privileges for a PowerShell process.");
            CertController.RunPowershellCommandAsAdmin(`certutil.exe -f -addstore Root '${process.cwd()}/${CertController.certFile}'`)
                .then(
                    () => Logger.info("Added self-signed x509 certificate"),
                    (error) =>
                    {
                        Logger.log("------------------------------------------------------------------------------------------");
                        Logger.error("Certificate installation failed. You will most likely run into issues in-game!");
                        Logger.error("Please run the following command in cmd with admin privileges:");
                        Logger.log(`certutil.exe -f -addstore Root "${process.cwd()}\\${CertController.certFile.replace(/\//g, "\\")}"`);
                        Logger.log("------------------------------------------------------------------------------------------");
                        throw error;
                    });
        }
        else
        {
            Logger.error("You're running the server on a platform that's not supported - certificate installation must be done manually.");
            Logger.info("For Windows systems, you can run the following command in cmd with admin priviledges:");
            Logger.info(`certutil.exe -f -addstore Root "${process.cwd()}\\${CertController.certFile.replace(/\//g, "\\")}"`);
        }

        CertController.certs = {
            "cert": forge.pki.certificateToPem(cert),
            "key": forge.pki.privateKeyToPem(keys.privateKey)
        };
    }

    static async RunPowershellCommandAsAdmin(command)
    {
        if (typeof command !== "string")
        {
            throw "Non-string commands are not supported";
        }

        const shell = new Shell({});
        await shell.addCommand("Start-Process");
        await shell.addArgument("PowerShell");
        // Elevate the process
        await shell.addArgument("-Verb");
        await shell.addArgument("RunAs");
        // Hide the window for cleaner UX
        await shell.addArgument("-WindowStyle");
        await shell.addArgument("Hidden");
        // Propagate output from child process
        await shell.addArgument("-PassThru");
        // Wait for the child process to finish before exiting
        await shell.addArgument("-Wait");
        // Pass argument list to use in elevated PowerShell
        await shell.addArgument("-ArgumentList");
        await shell.addArgument(`"${command}"`);

        await shell.invoke();
        return await shell.dispose();
    }
}

module.exports = CertController;
