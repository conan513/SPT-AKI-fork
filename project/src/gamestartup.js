"use strict";

class GameStartupCallbacks
{
    constructor()
    {
        router.addStaticRoute("/client/game/config", this.getGameConfig.bind());
        router.addStaticRoute("/client/game/profile/select", this.selectProfile.bind());
        router.addStaticRoute("/client/profile/status", this.getProfileStatus.bind());
        router.addStaticRoute("/client/server/list", this.getServer.bind());
        router.addStaticRoute("/client/game/version/validate", response_f.nullResponse);
        router.addStaticRoute("/client/game/start", response_f.nullResponse);
        router.addStaticRoute("/client/game/logout", response_f.nullResponse);
        router.addStaticRoute("/client/checkVersion", this.validateGameVersion.bind());
    }

    getGameConfig(url, info, sessionID)
    {
        return response_f.getBody({"queued": false, "banTime": 0, "hash": "BAN0", "lang": "en", "aid": sessionID, "token": "token_" + sessionID, "taxonomy": "341", "activeProfileId": "user" + sessionID + "pmc", "nickname": "user", "backend": {"Trading": server.getBackendUrl(), "Messaging": server.getBackendUrl(), "Main": server.getBackendUrl(), "RagFair": server.getBackendUrl()}, "totalInGame": 0});
    }

    selectProfile(url, info, sessionID)
    {
        return response_f.getBody({"status":"ok", "notifier": {"server": server.getBackendUrl() + "/", "channel_id": "testChannel"}});
    }

    getProfileStatus(url, info, sessionID)
    {
        return response_f.getBody([{"profileid": "scav" + sessionID, "status": "Free", "sid": "", "ip": "", "port": 0}, {"profileid": "pmc" + sessionID, "status": "Free", "sid": "", "ip": "", "port": 0}]);
    }

    getServer(url, info, sessionID)
    {
        return response_f.getBody([{"ip": server.getIp(), "port": server.getPort()}]);
    }

    validateGameVersion(url, info, sessionID)
    {
        return response_f.getBody({"isvalid": true, "latestVersion": ""});
    }
}

module.exports.gameStartupCallbacks = new GameStartupCallbacks();
