"use strict";

require("../Lib.js");

class ProfileController
{
    static onLoad(sessionID)
    {
        let profile = SaveServer.profiles[sessionID];

        if (!("characters" in profile))
        {
            profile.characters = {
                "pmc": {},
                "scav": {}
            };
        }

        return profile;
    }

    static getPmcProfile(sessionID)
    {
        if (SaveServer.profiles[sessionID] === undefined || SaveServer.profiles[sessionID].characters.pmc === undefined)
        {
            return undefined;
        }

        return SaveServer.profiles[sessionID].characters.pmc;
    }

    static getScavProfile(sessionID)
    {
        return SaveServer.profiles[sessionID].characters.scav;
    }

    static setScavProfile(sessionID, scavData)
    {
        SaveServer.profiles[sessionID].characters.scav = scavData;
    }

    static getCompleteProfile(sessionID)
    {
        let output = [];

        if (!LauncherController.isWiped(sessionID))
        {
            output.push(ProfileController.getPmcProfile(sessionID));
            output.push(ProfileController.getScavProfile(sessionID));
        }

        return output;
    }

    static createProfile(info, sessionID)
    {
        const account = LauncherController.find(sessionID);
        const profile = DatabaseServer.tables.templates.profiles[account.edition][info.side.toLowerCase()];
        let pmcData = profile.character;

        // delete existing profile
        if (sessionID in SaveServer.profiles)
        {
            delete SaveServer.profiles[sessionID];
        }

        // pmc
        pmcData._id = "pmc" + sessionID;
        pmcData.aid = sessionID;
        pmcData.savage = "scav" + sessionID;
        pmcData.Info.Nickname = info.nickname;
        pmcData.Info.LowerNickname = info.nickname.toLowerCase();
        pmcData.Info.RegistrationDate = TimeUtil.getTimestamp();
        pmcData.Info.Voice = DatabaseServer.tables.templates.customization[info.voiceId]._name;
        pmcData.Customization.Head = info.headId;
        pmcData.Health.UpdateTime = TimeUtil.getTimestamp();
        pmcData.Quests = [];

        // create profile
        SaveServer.profiles[sessionID] = {
            "info": account,
            "characters": {
                "pmc": pmcData,
                "scav": {}
            },
            "suits": profile.suits,
            "weaponbuilds": profile.weaponbuilds,
            "dialogues": profile.dialogues
        };

        // pmc profile needs to exist first
        SaveServer.profiles[sessionID].characters.scav = ProfileController.generateScav(sessionID);

        for (let traderID in DatabaseServer.tables.traders)
        {
            ProfileController.resetTrader(sessionID, traderID);
        }

        // store minimal profile and reload it
        SaveServer.saveProfile(sessionID);
        SaveServer.loadProfile(sessionID);

        // completed account creation
        SaveServer.profiles[sessionID].info.wipe = false;
        SaveServer.saveProfile(sessionID);
    }

    static resetTrader(sessionID, traderID)
    {
        const account = LauncherController.find(sessionID);
        const pmcData = ProfileController.getPmcProfile(sessionID);
        const traderWipe = DatabaseServer.tables.templates.profiles[account.edition][pmcData.Info.Side.toLowerCase()].trader;

        pmcData.TraderStandings[traderID] = {
            "currentLevel": 1,
            "currentSalesSum": traderWipe.initialSalesSum,
            "currentStanding": traderWipe.initialStanding,
            "NextLoyalty": null,
            "loyaltyLevels": DatabaseServer.tables.traders[traderID].base.loyalty.loyaltyLevels,
            "display": DatabaseServer.tables.traders[traderID].base.display
        };

        // Why doesn't this work?
        // TraderController.lvlUp(sessionID, traderID);
    }

    static generateScav(sessionID)
    {
        const pmcData = ProfileController.getPmcProfile(sessionID);
        let scavData = BotController.generate({
            "conditions": [
                {
                    "Role": "playerScav",
                    "Limit": 1,
                    "Difficulty": "normal"
                }
            ]
        })[0];

        // add proper metadata
        scavData._id = pmcData.savage;
        scavData.aid = sessionID;
        scavData.Info.Settings = {};

        // remove secure container
        scavData = InventoryHelper.removeSecureContainer(scavData);

        // set cooldown timer
        scavData = ProfileController.setScavCooldownTimer(scavData, pmcData);

        // add scav to the profile
        ProfileController.setScavProfile(sessionID, scavData);
        return scavData;
    }

    static setScavCooldownTimer(profile, pmcData)
    {
        // Set cooldown time.
        // Make sure to apply ScavCooldownTimer bonus from Hideout if the player has it.
        let scavLockDuration = DatabaseServer.tables.globals.config.SavagePlayCooldown;
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
        profile.Info.SavageLockTime = (Date.now() / 1000) + scavLockDuration;
        return profile;
    }

    static isNicknameTaken(info, sessionID)
    {
        for (const id in SaveServer.profiles)
        {
            const profile = SaveServer.profiles[id];

            if (!("characters" in profile) || !("pmc" in profile.characters) || !("Info" in profile.characters.pmc))
            {
                continue;
            }

            if (profile.info.id !== sessionID && profile.characters.pmc.Info.LowerNickname === info.nickname.toLowerCase())
            {
                return true;
            }
        }

        return false;
    }

    static validateNickname(info, sessionID)
    {
        if (info.nickname.length < 3)
        {
            return "tooshort";
        }

        if (ProfileController.isNicknameTaken(info, sessionID))
        {
            return "taken";
        }

        return "OK";
    }

    static changeNickname(info, sessionID)
    {
        let output = ProfileController.validateNickname(info, sessionID);

        if (output === "OK")
        {
            let pmcData = ProfileController.getPmcProfile(sessionID);

            pmcData.Info.Nickname = info.nickname;
            pmcData.Info.LowerNickname = info.nickname.toLowerCase();
        }

        return output;
    }

    static getProfileByPmcId(pmcId)
    {
        for (const sessionID in SaveServer.profiles)
        {
            if (SaveServer.profiles[sessionID].characters.pmc._id === pmcId)
            {
                return SaveServer.profiles[sessionID].characters.pmc;
            }
        }

        return undefined;
    }

    static getExperience(level)
    {
        const expTable = DatabaseServer.tables.globals.config.exp.level.exp_table;
        let exp = 0;

        if (level >= expTable.length)
        {
            // make sure to not go out of bounds
            level = expTable.length - 1;
        }

        for (let i = 0; i < level; i++)
        {
            exp += expTable[i].exp;
        }

        return exp;
    }

    static getMaxLevel()
    {
        return DatabaseServer.tables.globals.config.exp.level.exp_table.length - 1;
    }

    static getMiniProfile(sessionID)
    {
        const maxlvl = ProfileController.getMaxLevel();

        // make sure character completed creation
        if (!("Info" in SaveServer.profiles[sessionID].characters.pmc) || !("Level" in SaveServer.profiles[sessionID].characters.pmc.Info))
        {
            return {
                "nickname": "unknown",
                "side": "unknown",
                "currlvl": 0,
                "currexp": 0,
                "prevexp": 0,
                "nextlvl": 0,
                "maxlvl": maxlvl
            }
        }

        const profile = SaveServer.profiles[sessionID].characters.pmc;
        const currlvl = profile.Info.Level;
        const nextlvl = ProfileController.getExperience(currlvl + 1)
        const result = {
            "nickname": profile.Info.Nickname,
            "side": profile.Info.Side,
            "currlvl": profile.Info.Level,
            "currexp": profile.Info.Experience,
            "prevexp": (currlvl === 0) ? 0 : ProfileController.getExperience(currlvl),
            "nextlvl": nextlvl,
            "maxlvl": maxlvl
        };

        console.log(result);
        return result;
    }
}

module.exports = ProfileController;
