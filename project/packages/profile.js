/* profile.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

/*
* controller class maintains list of active profiles for each sessionID in memory. All first-time loads and save
* operations also write to disk.*
*/
class Controller
{
    onLoad(sessionID)
    {
        let profile = save_f.server.profiles[sessionID];

        if (!("characters" in profile))
        {
            profile.characters = {
                "pmc": {},
                "scav": {}
            };
        }

        return profile;
    }

    getPmcProfile(sessionID)
    {
        return save_f.server.profiles[sessionID].characters.pmc;
    }

    getScavProfile(sessionID)
    {
        return save_f.server.profiles[sessionID].characters.scav;
    }

    setScavProfile(sessionID, scavData)
    {
        save_f.server.profiles[sessionID].characters.scav = scavData;
    }

    getCompleteProfile(sessionID)
    {
        let output = [];

        if (!account_f.controller.isWiped(sessionID))
        {
            output.push(this.getPmcProfile(sessionID));
            output.push(this.getScavProfile(sessionID));
        }

        return output;
    }

    createProfile(info, sessionID)
    {
        const account = account_f.controller.find(sessionID);
        const profile = database_f.database.tables.templates.profiles[account.edition][info.side.toLowerCase()];
        let pmcData = profile.character;

        // delete existing profile
        if (sessionID in save_f.server.profiles)
        {
            delete save_f.server.profiles[sessionID];
        }

        // pmc
        pmcData._id = "pmc" + sessionID;
        pmcData.aid = sessionID;
        pmcData.savage = "scav" + sessionID;
        pmcData.Info.Nickname = info.nickname;
        pmcData.Info.LowerNickname = info.nickname.toLowerCase();
        pmcData.Info.RegistrationDate = Math.floor(new Date() / 1000);
        pmcData.Health.UpdateTime = Math.round(Date.now() / 1000);
        pmcData.Quests = quest_f.controller.getAllProfileQuests();

        // create profile
        save_f.server.profiles[sessionID] = {
            "info": account,
            "characters": {
                "pmc": pmcData,
                "scav": {}
            },
            "suits": profile.suits,
            "weaponbuilds": profile.weaponbuilds,
            "dialogues": profile.dialogues,
            "events": profile.events
        };

        // pmc profile needs to exist first
        save_f.server.profiles[sessionID].characters.scav = this.generateScav(sessionID);

        for (let traderID in database_f.database.tables.traders)
        {
            this.resetTrader(sessionID, traderID);
        }

        // store minimal profile and reload it
        save_f.server.onSaveProfile(sessionID);
        save_f.server.onLoadProfile(sessionID);

        // completed account creation
        save_f.server.profiles[sessionID].info.wipe = false;
        save_f.server.onSaveProfile(sessionID);
    }

    resetTrader(sessionID, traderID)
    {
        const account = account_f.controller.find(sessionID);
        const pmcData = profile_f.controller.getPmcProfile(sessionID);
        const traderWipe = database_f.database.tables.templates.profiles[account.edition][pmcData.Info.Side.toLowerCase()].trader;

        pmcData.TraderStandings[traderID] = {
            "currentLevel": 1,
            "currentSalesSum": traderWipe.initialSalesSum,
            "currentStanding": traderWipe.initialStanding,
            "NextLoyalty": null,
            "loyaltyLevels": database_f.database.tables.traders[traderID].base.loyalty.loyaltyLevels,
            "display": database_f.database.tables.traders[traderID].base.display
        };
    }

    generateScav(sessionID)
    {
        const pmcData = this.getPmcProfile(sessionID);
        let scavData = bots_f.controller.generate({ "conditions": [{ "Role": "playerScav", "Limit": 1, "Difficulty": "normal" }] })[0];

        // add proper metadata
        scavData._id = pmcData.savage;
        scavData.aid = sessionID;
        scavData.Info.Settings = {};

        // remove secure container
        scavData = helpfunc_f.helpFunctions.removeSecureContainer(scavData);

        // set cooldown timer
        scavData = this.setScavCooldownTimer(scavData, pmcData);

        // add scav to the profile
        this.setScavProfile(sessionID, scavData);
        return scavData;
    }

    setScavCooldownTimer(profile, pmcData)
    {
        // Set cooldown time.
        // Make sure to apply ScavCooldownTimer bonus from Hideout if the player has it.
        const currDt = Date.now() / 1000;
        let scavLockDuration = database_f.database.tables.globals.config.SavagePlayCooldown;
        let modifier = 1;

        for (const bonus of pmcData.Bonuses)
        {
            if (bonus.type === "ScavCooldownTimer")
            {
                // Value is negative, so add.
                // Also note that for scav cooldown, multiple bonuses stack additively.
                modifier += bonus.value / 100;
            }
        }

        scavLockDuration *= modifier;
        profile.Info.SavageLockTime = currDt + scavLockDuration;
        return profile;
    }

    isNicknameTaken(info)
    {
        for (const sessionID in save_f.server.profiles)
        {
            const profile = save_f.server.profiles[sessionID];

            if (!("characters" in profile) || !("pmc" in profile.characters) || !("Info" in profile.characters.pmc))
            {
                continue;
            }

            if (profile.characters.pmc.Info.LowerNickname === info.nickname.toLowerCase())
            {
                return true;
            }
        }

        return false;
    }

    validateNickname(info, sessionID)
    {
        if (info.nickname.length < 3)
        {
            return "tooshort";
        }

        if (this.isNicknameTaken(info))
        {
            return "taken";
        }

        return "OK";
    }

    changeNickname(info, sessionID)
    {
        let output = this.validateNickname(info, sessionID);

        if (output === "OK")
        {
            let pmcData = this.getPmcProfile(sessionID);

            pmcData.Info.Nickname = info.nickname;
            pmcData.Info.LowerNickname = info.nickname.toLowerCase();
        }

        return output;
    }

    changeVoice(info, sessionID)
    {
        let pmcData = this.getPmcProfile(sessionID);
        pmcData.Info.Voice = info.voice;
    }

    resetProfileQuestCondition(sessionID, conditionId)
    {
        let startedQuests = this.getPmcProfile(sessionID).Quests.filter(q => q.status === "Started");

        for (let quest of startedQuests)
        {
            const index = quest.completedConditions.indexOf(conditionId);

            if (index > -1)
            {
                quest.completedConditions.splice(index, 1);
            }
        }
    }
}

class Callbacks
{
    constructor()
    {
        save_f.server.onLoadCallback["profile"] = this.onLoad.bind(this);

        router_f.router.staticRoutes["/client/game/profile/create"] = this.createProfile.bind(this);
        router_f.router.staticRoutes["/client/game/profile/list"] = this.getProfileData.bind(this);
        router_f.router.staticRoutes["/client/game/profile/savage/regenerate"] = this.regenerateScav.bind(this);
        router_f.router.staticRoutes["/client/game/profile/voice/change"] = this.changeVoice.bind(this);
        router_f.router.staticRoutes["/client/game/profile/nickname/change"] = this.changeNickname.bind(this);
        router_f.router.staticRoutes["/client/game/profile/nickname/validate"] = this.validateNickname.bind(this);
        router_f.router.staticRoutes["/client/game/profile/nickname/reserved"] = this.getReservedNickname.bind(this);
    }

    onLoad(sessionID)
    {
        return profile_f.controller.onLoad(sessionID);
    }

    createProfile(url, info, sessionID)
    {
        profile_f.controller.createProfile(info, sessionID);
        return response_f.controller.getBody({"uid": "pmc" + sessionID});
    }

    getProfileData(url, info, sessionID)
    {
        return response_f.controller.getBody(profile_f.controller.getCompleteProfile(sessionID));
    }

    regenerateScav(url, info, sessionID)
    {
        return response_f.controller.getBody([profile_f.controller.generateScav(sessionID)]);
    }

    changeVoice(url, info, sessionID)
    {
        profile_f.controller.changeVoice(info, sessionID);
        return response_f.controller.nullResponse();
    }

    /// --- TODO: USE LOCALIZED STRINGS --- ///
    changeNickname(url, info, sessionID)
    {
        const output = profile_f.controller.changeNickname(info, sessionID);

        if (output === "taken")
        {
            return response_f.controller.getBody(null, 255, "The nickname is already in use");
        }

        if (output === "tooshort")
        {
            return response_f.controller.getBody(null, 1, "The nickname is too short");
        }

        return response_f.controller.getBody({"status": 0, "nicknamechangedate": Math.floor(new Date() / 1000)});
    }
    /// --- TODO: USE LOCALIZED STRINGS --- ///
    validateNickname(url, info, sessionID)
    {
        const output = profile_f.controller.validateNickname(info, sessionID);

        if (output === "taken")
        {
            return response_f.controller.getBody(null, 255, "The nickname is already in use");
        }

        if (output === "tooshort")
        {
            return response_f.controller.getBody(null, 256, "The nickname is too short");
        }

        return response_f.controller.getBody({"status": "ok"});
    }
    /// --- TODO: USE LOCALIZED STRINGS --- ///

    getReservedNickname(url, info, sessionID)
    {
        return response_f.controller.getBody("SPTarkov");
    }
}

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
