/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class GameCallbacks
{
    static versionValidate(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    static gameStart(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    static gameLogout(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    static getGameConfig(url, info, sessionID)
    {
        return https_f.response.getBody({
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
                "Trading": https_f.server.getBackendUrl(),
                "Messaging": https_f.server.getBackendUrl(),
                "Main": https_f.server.getBackendUrl(),
                "RagFair": https_f.server.getBackendUrl(),
            },
            "totalInGame": 1
        });
    }

    static getServer(url, info, sessionID)
    {
        return https_f.response.getBody([
            {
                "ip": https_f.config.ip,
                "port": https_f.config.port
            }
        ]);
    }

    static validateGameVersion(url, info, sessionID)
    {
        return https_f.response.getBody({
            "isvalid": true,
            "latestVersion": ""
        });
    }

    static gameKeepalive(url, info, sessionID)
    {
        return https_f.response.getBody({
            "msg": "OK"
        });
    }
}

module.exports = GameCallbacks;
