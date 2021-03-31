/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 * - Ereshkigal
 */

"use strict";

const InventoryHelper = require("../helpers/InventoryHelper");
const DatabaseServer = require("../servers/DatabaseServer");
const SaveServer = require("../servers/SaveServer.js");
const TimeUtil = require("../utils/TimeUtil");
const LauncherController = require("./LauncherController.js");

class ProfileController
{
    onLoad(sessionID)
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

    getPmcProfile(sessionID)
    {
        if (SaveServer.profiles[sessionID] === undefined || SaveServer.profiles[sessionID].characters.pmc === undefined)
        {
            return undefined;
        }

        return SaveServer.profiles[sessionID].characters.pmc;
    }

    getScavProfile(sessionID)
    {
        return SaveServer.profiles[sessionID].characters.scav;
    }

    setScavProfile(sessionID, scavData)
    {
        SaveServer.profiles[sessionID].characters.scav = scavData;
    }

    getCompleteProfile(sessionID)
    {
        let output = [];

        if (!LauncherController.isWiped(sessionID))
        {
            output.push(this.getPmcProfile(sessionID));
            output.push(this.getScavProfile(sessionID));
        }

        return output;
    }

    createProfile(info, sessionID)
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
        SaveServer.profiles[sessionID].characters.scav = this.generateScav(sessionID);

        for (let traderID in DatabaseServer.tables.traders)
        {
            this.resetTrader(sessionID, traderID);
        }

        // store minimal profile and reload it
        SaveServer.saveProfile(sessionID);
        SaveServer.loadProfile(sessionID);

        // completed account creation
        SaveServer.profiles[sessionID].info.wipe = false;
        SaveServer.saveProfile(sessionID);
    }

    resetTrader(sessionID, traderID)
    {
        const account = LauncherController.find(sessionID);
        const pmcData = profile_f.controller.getPmcProfile(sessionID);
        const traderWipe = DatabaseServer.tables.templates.profiles[account.edition][pmcData.Info.Side.toLowerCase()].trader;

        pmcData.TraderStandings[traderID] = {
            "currentLevel": 1,
            "currentSalesSum": traderWipe.initialSalesSum,
            "currentStanding": traderWipe.initialStanding,
            "NextLoyalty": null,
            "loyaltyLevels": DatabaseServer.tables.traders[traderID].base.loyalty.loyaltyLevels,
            "display": DatabaseServer.tables.traders[traderID].base.display
        };
    }

    generateScav(sessionID)
    {
        const pmcData = this.getPmcProfile(sessionID);
        let scavData = bots_f.controller.generate({
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
        scavData = this.setScavCooldownTimer(scavData, pmcData);

        // add scav to the profile
        this.setScavProfile(sessionID, scavData);
        return scavData;
    }

    setScavCooldownTimer(profile, pmcData)
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

    isNicknameTaken(info, sessionID)
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

    validateNickname(info, sessionID)
    {
        if (info.nickname.length < 3)
        {
            return "tooshort";
        }

        if (this.isNicknameTaken(info, sessionID))
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

    getProfileByPmcId(pmcId)
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
}

module.exports = new ProfileController();
