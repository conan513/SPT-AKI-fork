/* modules.js
 * contains responses for sptarkov singleplayer module requests
 * dependencies: NLog.SPTarkov.Singleplayer
 */

class ModulesController
{
    getBotLimit(type)
    {
        if (type === "cursedAssault" || type === "assaultGroup")
        {
            type = "assault";
        }

        return modules_f.modulesConfig.botLimits[type];
    }

    getBotDifficulty(type, difficulty)
    {
        switch (type)
        {
            case "core":
                return database_f.database.tables.bots.globalDifficulty;

            case "cursedassault":
                type = "assault";
                break;

            case "test":
            case "assaultgroup":
            case "followergluharsnipe":
            case "bosstest":
            case "followertest":
                /* unused bots by BSG, might have use */
                type = "pmcbot";
                break;

            default:
                break;
        }

        return database_f.database.tables.bots.type[type].difficulty[difficulty];
    }
}

class ModulesCallbacks
{
    constructor()
    {
        router.addStaticRoute("/raid/map/name", this.registerPlayer.bind());
        router.addStaticRoute("/raid/profile/save", this.saveProgress.bind());
        router.addDynamicRoute("/singleplayer/settings/weapon/durability/", this.getWeaponDurability.bind());
        router.addDynamicRoute("/singleplayer/settings/defaultRaidSettings/", this.getDefaultRaidSettings.bind());
        router.addDynamicRoute("/singleplayer/settings/bot/limit/", this.getBotLimit.bind());
        router.addDynamicRoute("/singleplayer/settings/bot/difficulty/", this.getBotDifficulty.bind());
    }

    registerPlayer(url, info, sessionID)
    {
        offraid_f.inraidServer.addPlayer(sessionID, info);
    }

    saveProgress(url, info, sessionID)
    {
        offraid_f.saveProgress(info, sessionID);
        return response_f.responseController.nullResponse();
    }

    getWeaponDurability(url, info, sessionID)
    {
        return response_f.responseController.noBody(modules_f.modulesConfig.saveWeaponDurability);
    }

    getDefaultRaidSettings(url, info, sessionID)
    {
        return response_f.responseController.noBody(modules_f.modulesConfig.defaultRaidSettings);
    }

    getBotLimit(url, info, sessionID)
    {
        let splittedUrl = url.split("/");
        let type = splittedUrl[splittedUrl.length - 1];
        return response_f.responseController.noBody(modules_f.modulesController.getBotLimit(type));
    }

    getBotDifficulty(url, info, sessionID)
    {
        let splittedUrl = url.split("/");
        let type = splittedUrl[splittedUrl.length - 2].toLowerCase();
        let difficulty = splittedUrl[splittedUrl.length - 1];
        return response_f.responseController.noBody(modules_f.modulesController.getBotDifficulty(type, difficulty));
    }
}

class ModulesConfig
{
    constructor()
    {
        this.saveWeaponDurability = true;
        this.defaultRaidSettings = {
            "aiAmount": "AsOnline",
            "aiDifficulty": "AsOnline",
            "bossEnabled": true,
            "scavWars": false,
            "taggedAndCursed": false
        };
        this.botLimits = {
            "assault": 30,
            "marksman": 30,
            "pmcBot": 30,
            "bossBully": 30,
            "bossGluhar": 30,
            "bossKilla": 30,
            "bossKojaniy": 30,
            "bossSanitar": 30,
            "followerBully": 30,
            "followerGluharAssault": 30,
            "followerGluharScout": 30,
            "followerGluharSecurity": 30,
            "followerGluharSnipe": 30,
            "followerKojaniy": 30,
            "followerSanitar": 30,
            "test": 30,
            "followerTest": 30,
            "bossTest": 30
        };
    }
}

module.exports.modulesController = new ModulesController();
module.exports.modulesCallbacks = new ModulesCallbacks();
module.exports.modulesConfig = new ModulesConfig();
