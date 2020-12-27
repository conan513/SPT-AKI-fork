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
        https_f.router.onStaticRoute["/client/game/config"] = this.getGameConfig.bind(this);
        https_f.router.onStaticRoute["/client/profile/status"] = this.getProfileStatus.bind(this);
        https_f.router.onStaticRoute["/client/server/list"] = this.getServer.bind(this);
        https_f.router.onStaticRoute["/client/game/version/validate"] = this.versionValidate.bind(this);
        https_f.router.onStaticRoute["/client/game/start"] = this.gameStart.bind(this);
        https_f.router.onStaticRoute["/client/game/logout"] = this.gameLogout.bind(this);
        https_f.router.onStaticRoute["/client/checkVersion"] = this.validateGameVersion.bind(this);
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
                "Trading": https_f.config.backendUrl,
                "Messaging": https_f.config.backendUrl,
                "Main": https_f.config.backendUrl,
                "RagFair": https_f.config.backendUrl
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
}

module.exports.Callbacks = Callbacks;