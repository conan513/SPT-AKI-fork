/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Craink
 */

"use strict";

class Callbacks
{
    constructor()
    {
        router_f.router.staticRoutes["/client/game/config"] = this.getGameConfig.bind(this);
        router_f.router.staticRoutes["/client/profile/status"] = this.getProfileStatus.bind(this);
        router_f.router.staticRoutes["/client/server/list"] = this.getServer.bind(this);
        router_f.router.staticRoutes["/client/game/version/validate"] = this.versionValidate.bind(this);
        router_f.router.staticRoutes["/client/game/start"] = this.gameStart.bind(this);
        router_f.router.staticRoutes["/client/game/logout"] = this.gameLogout.bind(this);
        router_f.router.staticRoutes["/client/checkVersion"] = this.validateGameVersion.bind(this);
    }

    versionValidate(url, info, sessionID)
    {
        return response_f.controller.nullResponse();
    }

    gameStart(url, info, sessionID)
    {
        return response_f.controller.nullResponse();
    }

    gameLogout(url, info, sessionID)
    {
        return response_f.controller.nullResponse();
    }

    getGameConfig(url, info, sessionID)
    {
        return response_f.controller.getBody({
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
                "Trading": server_f.server.backendUrl,
                "Messaging": server_f.server.backendUrl,
                "Main": server_f.server.backendUrl,
                "RagFair": server_f.server.backendUrl
            },
            "totalInGame": 1
        });
    }

    getProfileStatus(url, info, sessionID)
    {
        return response_f.controller.getBody([
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
        return response_f.controller.getBody([
            {
                "ip": server_f.server.ip,
                "port": server_f.server.port
            }
        ]);
    }

    validateGameVersion(url, info, sessionID)
    {
        return response_f.controller.getBody({
            "isvalid": true,
            "latestVersion": ""
        });
    }
}

module.exports.Callbacks = Callbacks;
