/* server.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Apofis
 */

"use strict";

const fs = require("fs");
const zlib = require("zlib");
const https = require("https");
const selfsigned = require("selfsigned");

class Server
{
    constructor()
    {
        this.buffers = {};
        this.startCallback = {};
        this.receiveCallback = {};
        this.respondCallback = {};
        this.name = "Local SPT-AKI Server";
        this.ip = "127.0.0.1";
        this.port = 443;
        this.backendUrl = `https://${this.ip}:${this.port}`;
        this.mime = {
            txt: "text/plain",
            jpg: "image/jpeg",
            png: "image/png",
            json: "application/json"
        };

        this.respondCallback["DONE"] = this.killResponse.bind(this);
    }

    getCookies(req)
    {
        let found = {};
        let cookies = req.headers.cookie;

        if (cookies)
        {
            for (let cookie of cookies.split(";"))
            {
                let parts = cookie.split("=");

                found[parts.shift().trim()] = decodeURI(parts.join("="));
            }
        }

        return found;
    }

    resetBuffer(sessionID)
    {
        this.buffers[sessionID] = undefined;
    }

    putInBuffer(sessionID, data, bufLength)
    {
        if (this.buffers[sessionID] === undefined || this.buffers[sessionID].allocated !== bufLength)
        {
            this.buffers[sessionID] = {
                written: 0,
                allocated: bufLength,
                buffer: Buffer.alloc(bufLength)
            };
        }

        let buf = this.buffers[sessionID];

        data.copy(buf.buffer, buf.written, 0);
        buf.written += data.length;
        return buf.written === buf.allocated;
    }

    getFromBuffer(sessionID)
    {
        return this.buffers[sessionID].buffer;
    }

    generateCertificate()
    {
        const certDir = "user/certs/";
        const certFile = `${certDir}cert.pem`;
        const keyFile = `${certDir}key.pem`;
        let cert;
        let key;

        try
        {
            cert = fs.readFileSync(certFile);
            key = fs.readFileSync(keyFile);
        }
        catch (e)
        {
            if (e.code === "ENOENT")
            {
                if (!fs.existsSync(certDir))
                {
                    utility.createDir(certDir);
                }

                let fingerprint;

                ({ cert, private: key, fingerprint } = selfsigned.generate([{ name: "commonName", value: this.ip + "/" }], { days: 365 }));

                logger.logInfo(`Generated self-signed x509 certificate ${fingerprint}`);

                fs.writeFileSync(certFile, cert);
                fs.writeFileSync(keyFile, key);
            }
            else
            {
                throw e;
            }
        }

        return { cert, key };
    }

    sendZlibJson(resp, output, sessionID)
    {
        resp.writeHead(200, "OK", {"Content-Type": this.mime["json"], "content-encoding" : "deflate", "Set-Cookie" : `PHPSESSID=${sessionID}`});

        zlib.deflate(output, function (err, buf)
        {
            resp.end(buf);
        });
    }

    sendTextJson(resp, output)
    {
        resp.writeHead(200, "OK", {"Content-Type": this.mime["json"]});
        resp.end(output);
    }

    sendFile(resp, file)
    {
        let pathSlic = file.split("/");
        let type = this.mime[pathSlic[pathSlic.length - 1].split(".")[1]] || this.mime["txt"];
        let fileStream = fs.createReadStream(file);

        fileStream.on("open", function ()
        {
            resp.setHeader("Content-Type", type);
            fileStream.pipe(resp);
        });
    }

    killResponse()
    {
        return;
    }

    sendResponse(sessionID, req, resp, body)
    {
        // get response
        const text = (body) ? body.toString() : "{}";
        const info = (text) ? json_f.instance.parse(text) : {};
        let output = router_f.router.getResponse(req, info, sessionID);

        /* route doesn't exist or response is not properly set up */
        if (!output)
        {
            logger.logError(`[UNHANDLED][${req.url}]`);
            logger.log(info);
            output = response_f.controller.getBody(null, 404, `UNHANDLED RESPONSE: ${req.url}`);
        }

        // execute data received callback
        for (let type in this.receiveCallback)
        {
            this.receiveCallback[type](sessionID, req, resp, info, output);
        }

        // send response
        if (output in this.respondCallback)
        {
            this.respondCallback[output](sessionID, req, resp, info);
        }
        else
        {
            this.sendZlibJson(resp, output, sessionID);
        }
    }

    handleRequest(req, resp)
    {
        const IP = req.connection.remoteAddress.replace("::ffff:", "");
        const sessionID = this.getCookies(req)["PHPSESSID"];

        logger.log(`[${sessionID}][${IP}] ${req.url}`);

        // request without data
        if (req.method === "GET")
        {
            this.sendResponse(sessionID, req, resp, "");
        }

        // request with data
        if (req.method === "POST")
        {
            req.on("data", (data) =>
            {
                zlib.inflate(data, (err, body) =>
                {
                    server_f.server.sendResponse(sessionID, req, resp, body);
                });
            });
        }

        if (req.method === "PUT")
        {
            req.on("data", (data) =>
            {
                // receive data
                if ("expect" in req.headers)
                {
                    const requestLength = parseInt(req.headers["content-length"]);

                    if (!this.putInBuffer(req.headers.sessionid, data, requestLength))
                    {
                        resp.writeContinue();
                    }
                }
            });

            req.on("end", () =>
            {
                const data = this.getFromBuffer(sessionID);
                this.resetBuffer(sessionID);

                zlib.inflate(data, (err, body) =>
                {
                    server_f.server.sendResponse(sessionID, req, resp, body);
                });
            });
        }
    }

    start()
    {
        // execute start callback
        logger.logWarning("Server: executing startup callbacks...");

        for (let type in this.startCallback)
        {
            this.startCallback[type]();
        }

        /* create server */
        let httpsServer = https.createServer(this.generateCertificate(), (req, res) =>
        {
            this.handleRequest(req, res);
        }).listen(this.port, this.ip, () =>
        {
            logger.logSuccess("Started server");
        });

        /* server is already running or program using privileged port without root */
        httpsServer.on("error", (e) =>
        {
            if (process.platform === "linux" && !(process.getuid && process.getuid() === 0) && e.port < 1024)
            {
                logger.logError("» Non-root processes cannot bind to ports below 1024");
            }
            else
            {
                logger.logError("» Port " + e.port + " is already in use, check if the server isn't already running");
            }
        });
    }
}

module.exports.server = new Server();