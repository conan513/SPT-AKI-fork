/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const HttpResponse = require("../utils/HttpResponse");
const HttpConfig = require("../configs/Httpconfig.js");
const HttpServer = require("../servers/HttpServer.js");

class GameCallbacks
{
    static versionValidate(url, info, sessionID)
    {
        return HttpResponse.nullResponse();
    }

    static gameStart(url, info, sessionID)
    {
        return HttpResponse.nullResponse();
    }

    static gameLogout(url, info, sessionID)
    {
        return HttpResponse.nullResponse();
    }

    static getGameConfig(url, info, sessionID)
    {
        return HttpResponse.getBody({
            "queued": false,
            "banTime": 0,
            "hash": "BAN0",
            "lang": "en",
            "aid": sessionID,
            "token": `token_${sessionID}`,
            "taxonomy": "341",
            "activeProfileId": `pmc${sessionID}`,
            "nickname": "user",
            "backend": {
                "Trading": HttpServer.getBackendUrl(),
                "Messaging": HttpServer.getBackendUrl(),
                "Main": HttpServer.getBackendUrl(),
                "RagFair": HttpServer.getBackendUrl(),
            },
            "totalInGame": 1
        });
    }

    static getServer(url, info, sessionID)
    {
        return HttpResponse.getBody([
            {
                "ip": HttpConfig.ip,
                "port": HttpConfig.port
            }
        ]);
    }

    static validateGameVersion(url, info, sessionID)
    {
        return HttpResponse.getBody({
            "isvalid": true,
            "latestVersion": ""
        });
    }

    static gameKeepalive(url, info, sessionID)
    {
        return HttpResponse.getBody({
            "msg": "OK"
        });
    }
}

module.exports = GameCallbacks;
