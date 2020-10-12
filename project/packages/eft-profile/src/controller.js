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
        const profile = database_f.server.tables.templates.profiles[account.edition][info.side.toLowerCase()];
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
        pmcData.Info.RegistrationDate = common_f.time.getTimestamp();
        pmcData.Health.UpdateTime = common_f.time.getTimestamp();
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

        for (let traderID in database_f.server.tables.traders)
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
        const traderWipe = database_f.server.tables.templates.profiles[account.edition][pmcData.Info.Side.toLowerCase()].trader;

        pmcData.TraderStandings[traderID] = {
            "currentLevel": 1,
            "currentSalesSum": traderWipe.initialSalesSum,
            "currentStanding": traderWipe.initialStanding,
            "NextLoyalty": null,
            "loyaltyLevels": database_f.server.tables.traders[traderID].base.loyalty.loyaltyLevels,
            "working": database_f.server.tables.traders[traderID].base.working
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
        let scavLockDuration = database_f.server.tables.globals.config.SavagePlayCooldown;
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

module.exports.Controller = Controller;
