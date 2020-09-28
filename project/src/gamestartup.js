/* gamestartup.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class GameStartupCallbacks
{
    constructor()
    {
        router.addStaticRoute("/client/game/config", this.getGameConfig.bind());
        router.addStaticRoute("/client/game/profile/select", this.selectProfile.bind());
        router.addStaticRoute("/client/profile/status", this.getProfileStatus.bind());
        router.addStaticRoute("/client/server/list", this.getServer.bind());
        router.addStaticRoute("/client/game/version/validate", this.versionValidate.bind());
        router.addStaticRoute("/client/game/start", this.gameStart.bind());
        router.addStaticRoute("/client/game/logout", this.gameLogout.bind());
        router.addStaticRoute("/client/checkVersion", this.validateGameVersion.bind());
    }

    versionValidate(url, info, sessionID)
    {
        return response_f.responseController.nullResponse();
    }

    gameStart(url, info, sessionID)
    {
        return response_f.responseController.nullResponse();
    }

    gameLogout(url, info, sessionID)
    {
        return response_f.responseController.nullResponse();
    }

    getGameConfig(url, info, sessionID)
    {
        return response_f.responseController.getBody({"queued": false, "banTime": 0, "hash": "BAN0", "lang": "en", "aid": sessionID, "token": "token_" + sessionID, "taxonomy": "341", "activeProfileId": "user" + sessionID + "pmc", "nickname": "user", "backend": {"Trading": server.getBackendUrl(), "Messaging": server.getBackendUrl(), "Main": server.getBackendUrl(), "RagFair": server.getBackendUrl()}, "totalInGame": 0});
    }

    selectProfile(url, info, sessionID)
    {
        return response_f.responseController.getBody({"status":"ok", "notifier": {"server": server.getBackendUrl() + "/", "channel_id": "testChannel"}});
    }

    getProfileStatus(url, info, sessionID)
    {
        return response_f.responseController.getBody([{"profileid": "scav" + sessionID, "status": "Free", "sid": "", "ip": "", "port": 0}, {"profileid": "pmc" + sessionID, "status": "Free", "sid": "", "ip": "", "port": 0}]);
    }

    getServer(url, info, sessionID)
    {
        return response_f.responseController.getBody([{"ip": server.getIp(), "port": server.getPort()}]);
    }

    validateGameVersion(url, info, sessionID)
    {
        return response_f.responseController.getBody({"isvalid": true, "latestVersion": ""});
    }
}

module.exports.gameStartupCallbacks = new GameStartupCallbacks();
