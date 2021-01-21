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
    constructor()
    {
        https_f.router.addStaticRoute("/client/game/config", "Aki", this.getGameConfig.bind(this));
        https_f.router.addStaticRoute("/client/server/list", "Aki", this.getServer.bind(this));
        https_f.router.addStaticRoute("/client/game/version/validate", "Aki", this.versionValidate.bind(this));
        https_f.router.addStaticRoute("/client/game/start", "Aki", this.gameStart.bind(this));
        https_f.router.addStaticRoute("/client/game/logout", "Aki", this.gameLogout.bind(this));
        https_f.router.addStaticRoute("/client/checkVersion", "Aki", this.validateGameVersion.bind(this));
        https_f.router.addStaticRoute("/client/game/keepalive", "Aki", this.gameKeepalive.bind(this));
    }

    versionValidate(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    gameStart(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    gameLogout(url, info, sessionID)
    {
        return https_f.response.nullResponse();
    }

    getGameConfig(url, info, sessionID)
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

    getServer(url, info, sessionID)
    {
        return https_f.response.getBody([
            {
                "ip": https_f.config.ip,
                "port": https_f.config.port
            }
        ]);
    }

    validateGameVersion(url, info, sessionID)
    {
        return https_f.response.getBody({
            "isvalid": true,
            "latestVersion": ""
        });
    }

    gameKeepalive(url, info, sessionID)
    {
        return https_f.response.getBody({ "msg": "OK" });
    }
}

module.exports = new GameCallbacks();
