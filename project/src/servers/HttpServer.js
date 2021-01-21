/* HttpServer.js
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
const WebSocket = require("ws");

class HttpServer
{
    constructor()
    {
        this.buffers = {};
        this.onReceive = {};
        this.onRespond = {};
        this.mime = {
            css:"text/css",
            bin: "application/octet-stream",
            html: "text/html",
            jpg: "image/jpeg",
            js: "text/javascript",
            json: "application/json",
            png: "image/png",
            svg: "image/svg+xml",
            txt: "text/plain",
        };
    }

    buildUrl()
    {
        return `${https_f.config.ip}:${https_f.config.port}`;
    }

    getBackendUrl()
    {
        return `https://${this.buildUrl()}`;
    }

    getWebsocketUrl()
    {
        return `wss://${this.buildUrl()}`;
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

    sendMessage(output)
    {
        try
        {
            this.websocket.send(JSON.stringify(output));
        }
        catch (err)
        {
            common_f.logger.logError(`sendMessage failed, with error: ${err}`);
        }
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

    sendResponse(sessionID, req, resp, body)
    {
        // get response
        const text = (body) ? body.toString() : "{}";
        const info = (text) ? common_f.json.deserialize(text) : {};
        let output = https_f.router.getResponse(req, info, sessionID);

        /* route doesn't exist or response is not properly set up */
        if (!output)
        {
            common_f.logger.logError(`[UNHANDLED][${req.url}]`);
            common_f.logger.log(info);
            output = https_f.response.getBody(null, 404, `UNHANDLED RESPONSE: ${req.url}`);
        }

        // execute data received callback
        for (const callback in this.onReceive)
        {
            this.onReceive[callback](sessionID, req, resp, info, output);
        }

        // send response
        if (output in this.onRespond)
        {
            this.onRespond[output](sessionID, req, resp, info);
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

        common_f.logger.log(`[${sessionID}][${IP}] ${req.url}`);

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
                    https_f.server.sendResponse(sessionID, req, resp, body);
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
                    https_f.server.sendResponse(sessionID, req, resp, body);
                });
            });
        }
    }

    load()
    {
        /* create server */
        const instance = https.createServer(certs_f.controller.getCerts(), (req, res) =>
        {
            this.handleRequest(req, res);
        }).listen(https_f.config.port, https_f.config.ip, () =>
        {
            common_f.logger.logSuccess(`Started webserver at ${this.getBackendUrl()}`);
        });
        this.instance = instance;

        // Setting up websocket
        const wss = new WebSocket.Server({
            server: this.instance
        });
        this.wss = wss;

        this.wss.addListener("listening", () =>
        {
            common_f.logger.logSuccess("Started websocket");
        });

        this.wss.addListener("connection", (ws) =>
        {
            this.websocket = ws;
            setInterval(() =>
            {
                if (ws.readyState === WebSocket.OPEN)
                {
                    ws.send(JSON.stringify(notifier_f.controller.defaultMessage));
                }
            }, 90000);
        });

        /* server is already running or program using privileged port without root */
        this.instance.on("error", (e) =>
        {
            if (process.platform === "linux" && !(process.getuid && process.getuid() === 0) && e.port < 1024)
            {
                common_f.logger.logError("Non-root processes cannot bind to ports below 1024");
            }
            else
            {
                common_f.logger.logError(`Port ${e.port} is already in use, check if the server isn't already running`);
            }
        });
    }
}

module.exports = new HttpServer();