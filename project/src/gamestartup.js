/* gamestartup.js
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
        router_f.router.addStaticRoute("/client/game/config", this.getGameConfig.bind());
        router_f.router.addStaticRoute("/client/game/profile/select", this.selectProfile.bind());
        router_f.router.addStaticRoute("/client/profile/status", this.getProfileStatus.bind());
        router_f.router.addStaticRoute("/client/server/list", this.getServer.bind());
        router_f.router.addStaticRoute("/client/game/version/validate", this.versionValidate.bind());
        router_f.router.addStaticRoute("/client/game/start", this.gameStart.bind());
        router_f.router.addStaticRoute("/client/game/logout", this.gameLogout.bind());
        router_f.router.addStaticRoute("/client/checkVersion", this.validateGameVersion.bind());
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
        return response_f.controller.getBody({"queued": false, "banTime": 0, "hash": "BAN0", "lang": "en", "aid": sessionID, "token": "token_" + sessionID, "taxonomy": "341", "activeProfileId": "user" + sessionID + "pmc", "nickname": "user", "backend": {"Trading": server_f.server.getBackendUrl(), "Messaging": server_f.server.getBackendUrl(), "Main": server_f.server.getBackendUrl(), "RagFair": server_f.server.getBackendUrl()}, "totalInGame": 0});
    }

    selectProfile(url, info, sessionID)
    {
        return response_f.controller.getBody({"status":"ok", "notifier": {"server": server_f.server.getBackendUrl() + "/", "channel_id": "testChannel"}});
    }

    getProfileStatus(url, info, sessionID)
    {
        return response_f.controller.getBody([{"profileid": "scav" + sessionID, "status": "Free", "sid": "", "ip": "", "port": 0}, {"profileid": "pmc" + sessionID, "status": "Free", "sid": "", "ip": "", "port": 0}]);
    }

    getServer(url, info, sessionID)
    {
        return response_f.controller.getBody([{"ip": server_f.server.getIp(), "port": server_f.server.getPort()}]);
    }

    validateGameVersion(url, info, sessionID)
    {
        return response_f.controller.getBody({"isvalid": true, "latestVersion": ""});
    }
}

module.exports.callbacks = new Callbacks();
