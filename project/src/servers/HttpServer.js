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
const HttpRouter = require("../routers/HttpRouter");
const CertController = require("../controllers/CertController");
const HttpConfig = require("../configs/Httpconfig.js");
const JsonUtil = require("../utils/JsonUtil");
const Logger = require("../utils/Logger");
const HttpResponse = require("../utils/HttpResponse");
const NotifierController = require("../controllers/NotifierController.js");
const HttpServer = require("../servers/HttpServer.js");

class HttpServer
{
    static buffers = {};
    static onReceive = {};
    static onRespond = require("../bindings/ServerRespond");
    static webSockets = {};
    static mime = {
        "css": "text/css",
        "bin": "application/octet-stream",
        "html": "text/html",
        "jpg": "image/jpeg",
        "js": "text/javascript",
        "json": "application/json",
        "png": "image/png",
        "svg": "image/svg+xml",
        "txt": "text/plain",
    };

    static buildUrl()
    {
        return `${HttpConfig.ip}:${HttpConfig.port}`;
    }

    static getBackendUrl()
    {
        return `https://${HttpServer.buildUrl()}`;
    }

    static getWebsocketUrl()
    {
        return `wss://${HttpServer.buildUrl()}`;
    }

    static getCookies(req)
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

    static resetBuffer(sessionID)
    {
        HttpServer.buffers[sessionID] = undefined;
    }

    static putInBuffer(sessionID, data, bufLength)
    {
        if (HttpServer.buffers[sessionID] === undefined || HttpServer.buffers[sessionID].allocated !== bufLength)
        {
            HttpServer.buffers[sessionID] = {
                written: 0,
                allocated: bufLength,
                buffer: Buffer.alloc(bufLength)
            };
        }

        let buf = HttpServer.buffers[sessionID];

        data.copy(buf.buffer, buf.written, 0);
        buf.written += data.length;
        return buf.written === buf.allocated;
    }

    static getFromBuffer(sessionID)
    {
        return HttpServer.buffers[sessionID].buffer;
    }

    static sendZlibJson(resp, output, sessionID)
    {
        resp.writeHead(200, "OK", {"Content-Type": HttpServer.mime["json"], "content-encoding" : "deflate", "Set-Cookie" : `PHPSESSID=${sessionID}`});

        zlib.deflate(output, function (err, buf)
        {
            resp.end(buf);
        });
    }

    static sendTextJson(resp, output)
    {
        resp.writeHead(200, "OK", {"Content-Type": HttpServer.mime["json"]});
        resp.end(output);
    }

    static sendMessage(output, sessionID)
    {
        try
        {
            if (HttpServer.webSockets[sessionID] !== undefined && HttpServer.webSockets[sessionID].readyState === WebSocket.OPEN)
            {
                HttpServer.webSockets[sessionID].send(JSON.stringify(output));
            }
            else
            {
                Logger.debug(`Socket not ready for ${sessionID}, message not sent`);
            }
        }
        catch (err)
        {
            Logger.error(`sendMessage failed, with error: ${err}`);
        }
    }

    static sendFile(resp, file)
    {
        let pathSlic = file.split("/");
        let type = HttpServer.mime[pathSlic[pathSlic.length - 1].split(".")[1]] || HttpServer.mime["txt"];
        let fileStream = fs.createReadStream(file);

        fileStream.on("open", function ()
        {
            resp.setHeader("Content-Type", type);
            fileStream.pipe(resp);
        });
    }

    static sendResponse(sessionID, req, resp, body)
    {
        // get response
        const text = (body) ? body.toString() : "{}";
        const info = (text) ? JsonUtil.deserialize(text) : {};
        let output = HttpRouter.getResponse(req, info, sessionID);

        /* route doesn't exist or response is not properly set up */
        if (!output)
        {
            Logger.error(`[UNHANDLED][${req.url}]`);
            Logger.log(info);
            output = HttpResponse.getBody(null, 404, `UNHANDLED RESPONSE: ${req.url}`);
        }

        // execute data received callback
        for (const callback in HttpServer.onReceive)
        {
            HttpServer.onReceive[callback](sessionID, req, resp, info, output);
        }

        // send response
        if (output in HttpServer.onRespond)
        {
            HttpServer.onRespond[output](sessionID, req, resp, info);
        }
        else
        {
            HttpServer.sendZlibJson(resp, output, sessionID);
        }
    }

    static handleRequest(req, resp)
    {
        const IP = req.connection.remoteAddress.replace("::ffff:", "");
        const sessionID = HttpServer.getCookies(req)["PHPSESSID"];

        Logger.log(`[${sessionID}][${IP}] ${req.url}`);

        // request without data
        if (req.method === "GET")
        {
            HttpServer.sendResponse(sessionID, req, resp, "");
        }

        // request with data
        if (req.method === "POST")
        {
            req.on("data", (data) =>
            {
                zlib.inflate(data, (err, body) =>
                {
                    HttpServer.sendResponse(sessionID, req, resp, body);
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

                    if (!HttpServer.putInBuffer(req.headers.sessionid, data, requestLength))
                    {
                        resp.writeContinue();
                    }
                }
            });

            req.on("end", () =>
            {
                const data = HttpServer.getFromBuffer(sessionID);
                HttpServer.resetBuffer(sessionID);

                zlib.inflate(data, (err, body) =>
                {
                    if (err)
                    {
                        // fallback uncompressed data
                        body = data;
                    }
                    HttpServer.sendResponse(sessionID, req, resp, body);
                });
            });
        }
    }

    static load()
    {
        /* create server */
        const httpss = https.createServer(CertController.getCerts(), (req, res) =>
        {
            HttpServer.handleRequest(req, res);
        });

        httpss.listen(HttpConfig.port, HttpConfig.ip, () =>
        {
            Logger.success(`Started webserver at ${HttpServer.getBackendUrl()}`);
        });

        httpss.on("error", (e) =>
        {
            /* server is already running or program using privileged port without root */
            if (process.platform === "linux" && !(process.getuid && process.getuid() === 0) && e.port < 1024)
            {
                Logger.error("Non-root processes cannot bind to ports below 1024");
            }
            else
            {
                Logger.error(`Port ${e.port} is already in use, check if the server isn't already running`);
            }
        });

        // Setting up websocket
        const wss = new WebSocket.Server({
            "server": httpss
        });

        wss.addListener("listening", () =>
        {
            Logger.success("Started websocket");
        });

        wss.addListener("connection", HttpServer.wsOnConnection.bind(this));
    }

    static wsOnConnection(ws, req)
    {
        // Strip request and break it into sections
        let splitUrl = req.url.replace(/\?.*$/, "").split("/");
        let sessionID = splitUrl.pop();

        Logger.info(`[WS] Player: ${sessionID} has connected`);

        ws.on("message", function message(msg)
        {
            // doesn't reach here
            Logger.info(`Received message ${msg} from user ${sessionID}`);
        });

        HttpServer.webSockets[sessionID] = ws;

        let pingHandler = setInterval(() =>
        {
            Logger.debug(`[WS] Pinging player: ${sessionID}`);

            if (ws.readyState === WebSocket.OPEN)
            {
                ws.send(JSON.stringify(NotifierController.defaultMessage));
            }
            else
            {
                Logger.debug("[WS] Socket lost, deleting handle");
                clearInterval(pingHandler);
                delete HttpServer.webSockets[sessionID];
            }
        }, 90000);
    }
}

module.exports = HttpServer;
