﻿"use strict";

const fs = require("fs");
const { resolve } = require("path");
const zlib = require("zlib");
const https = require("https");
const selfsigned = require("selfsigned");

function getCookies(req)
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

class Server
{
    constructor()
    {
        let config = json.parse(json.read("user/configs/server.json"));

        this.buffers = {};
        this.startCallback = {};
        this.receiveCallback = {};
        this.respondCallback = {};
        this.name = config.name;
        this.ip = config.ip;
        this.port = config.port;
        this.backendUrl = "https://" + this.ip + ":" + this.port;
        this.version = "0.12.7-R7";
        this.mime = {
            txt: "text/plain",
            jpg: "image/jpeg",
            png: "image/png",
            json: "application/json"
        };

        this.addRespondCallback("DONE", this.killResponse.bind(this));
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

    addStartCallback(type, worker)
    {
        this.startCallback[type] = worker;
    }

    addReceiveCallback(type, worker)
    {
        this.receiveCallback[type] = worker;
    }

    addRespondCallback(type, worker)
    {
        this.respondCallback[type] = worker;
    }

    getName()
    {
        return this.name;
    }

    getIp()
    {
        return this.ip;
    }

    getPort()
    {
        return this.port;
    }

    getBackendUrl()
    {
        return this.backendUrl;
    }

    getVersion()
    {
        return this.version;
    }

    generateCertificate()
    {

        const certDir = resolve(__dirname, "../../user/certs");
        const certFile = resolve(certDir, "cert.pem");
        const keyFile = resolve(certDir, "key.pem");
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
                    fs.mkdirSync(certDir);
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
        let output = "";

        // get response
        if (req.method === "POST" || req.method === "PUT")
        {
            output = router.getResponse(req, body, sessionID);
        }
        else
        {
            output = router.getResponse(req, "", sessionID);
        }

        /* route doesn't exist or response is not properly set up */
        if (output === "")
        {
            logger.logError("[UNHANDLED][" + req.url + "]");
            logger.logData(body);
            output = "{\"err\": 404, \"errmsg\": \"UNHANDLED RESPONSE: " + req.url + "\", \"data\": null}";
        }

        // execute data received callback
        for (let type in this.receiveCallback)
        {
            this.receiveCallback[type](sessionID, req, resp, body, output);
        }

        // send response
        if (output in this.respondCallback)
        {
            this.respondCallback[output](sessionID, req, resp, body);
        }
        else
        {
            this.sendZlibJson(resp, output, sessionID);
        }
    }

    handleRequest(req, resp)
    {
        const IP = req.connection.remoteAddress.replace("::ffff:", "");
        const sessionID = getCookies(req)["PHPSESSID"];

        logger.logRequest("[" + sessionID + "][" + IP + "] " + req.url);

        // request without data
        if (req.method === "GET")
        {
            server.sendResponse(sessionID, req, resp, "");
        }

        // request with data
        if (req.method === "POST")
        {
            req.on("data", function (data)
            {
                zlib.inflate(data, function (err, body)
                {
                    let jsonData = ((body !== typeof "undefined" && body !== null && body !== "") ? body.toString() : "{}");
                    server.sendResponse(sessionID, req, resp, jsonData);
                });
            });
        }

        if (req.method === "PUT")
        {
            req.on("data", function(data)
            {
                // receive data
                if ("expect" in req.headers)
                {
                    const requestLength = parseInt(req.headers["content-length"]);

                    if (!server.putInBuffer(req.headers.sessionid, data, requestLength))
                    {
                        resp.writeContinue();
                    }
                }
            });
            
            req.on("end", function()
            {
                let data = server.getFromBuffer(sessionID);
                server.resetBuffer(sessionID);

                zlib.inflate(data, function (err, body)
                {
                    let jsonData = ((body !== typeof "undefined" && body !== null && body !== "") ? body.toString() : "{}");
                    server.sendResponse(sessionID, req, resp, jsonData);
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
        }).listen(this.port, this.ip, function()
        {
            logger.logSuccess("Started server");
        });

        /* server is already running or program using privileged port without root */
        httpsServer.on("error", function(e)
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