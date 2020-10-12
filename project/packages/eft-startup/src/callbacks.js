/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Callbacks
{
    constructor()
    {
        https_f.router.staticRoutes["/client/game/config"] = this.getGameConfig.bind(this);
        https_f.router.staticRoutes["/client/profile/status"] = this.getProfileStatus.bind(this);
        https_f.router.staticRoutes["/client/server/list"] = this.getServer.bind(this);
        https_f.router.staticRoutes["/client/game/version/validate"] = this.versionValidate.bind(this);
        https_f.router.staticRoutes["/client/game/start"] = this.gameStart.bind(this);
        https_f.router.staticRoutes["/client/game/logout"] = this.gameLogout.bind(this);
        https_f.router.staticRoutes["/client/checkVersion"] = this.validateGameVersion.bind(this);
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
                "Trading": https_f.server.backendUrl,
                "Messaging": https_f.server.backendUrl,
                "Main": https_f.server.backendUrl,
                "RagFair": https_f.server.backendUrl
            },
            "totalInGame": 1
        });
    }

    getProfileStatus(url, info, sessionID)
    {
        return https_f.response.getBody([
            {
                "profileid": `scav${sessionID}`,
                "status": "Free",
                "sid": "",
                "ip": "",
                "port": 0
            },
            {
                "profileid": `pmc${sessionID}`,
                "status": "Free",
                "sid": "",
                "ip": "",
                "port": 0
            }
        ]);
    }

    getServer(url, info, sessionID)
    {
        return https_f.response.getBody([
            {
                "ip": https_f.server.ip,
                "port": https_f.server.port
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
}

module.exports.Callbacks = Callbacks;