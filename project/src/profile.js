"use strict";

/*
* profileController class maintains list of active profiles for each sessionID in memory. All first-time loads and save
* operations also write to disk.*
*/
class ProfileController
{
    constructor()
    {
        this.profiles = {};
    }

    initializeProfile(sessionID)
    {
        this.profiles[sessionID] = {};
        this.loadProfilesFromDisk(sessionID);
    }

    loadProfilesFromDisk(sessionID)
    {
        this.profiles[sessionID]["pmc"] = json.parse(json.read(getPmcPath(sessionID)));
        this.generateScav(sessionID);
    }

    getOpenSessions()
    {
        return Object.keys(this.profiles);
    }

    saveToDisk(sessionID)
    {
        if ("pmc" in this.profiles[sessionID])
        {
            json.write(getPmcPath(sessionID), this.profiles[sessionID]["pmc"]);
        }
    }

    /*
    * Get profile with sessionID of type (profile type in string, i.e. 'pmc').
    * If we don't have a profile for this sessionID yet, then load it and other related data
    * from disk.
    */
    getProfile(sessionID, type)
    {
        if (!(sessionID in this.profiles))
        {
            this.initializeProfile(sessionID);
            dialogue_f.dialogueServer.initializeDialogue(sessionID);
            health_f.healthServer.initializeHealth(sessionID);
            insurance_f.insuranceServer.resetSession(sessionID);
        }

        return this.profiles[sessionID][type];
    }

    getPmcProfile(sessionID)
    {
        return this.getProfile(sessionID, "pmc");
    }

    getScavProfile(sessionID)
    {
        return this.getProfile(sessionID, "scav");
    }

    setScavProfile(sessionID, scavData)
    {
        this.profiles[sessionID]["scav"] = scavData;
    }

    getCompleteProfile(sessionID)
    {
        let output = [];

        if (!account_f.accountServer.isWiped(sessionID))
        {
            output.push(profile_f.profileController.getPmcProfile(sessionID));
            output.push(profile_f.profileController.getScavProfile(sessionID));
        }

        return output;
    }

    createProfile(info, sessionID)
    {
        let account = account_f.accountServer.find(sessionID);
        let folder = account_f.getPath(account.id);
        let pmcData = json.parse(json.read(db.profile[account.edition]["character_" + info.side.toLowerCase()]));
        let storage = json.parse(json.read(db.profile[account.edition]["storage_" + info.side.toLowerCase()]));

        // delete existing profile
        if (this.profiles[account.id])
        {
            delete this.profiles[account.id];

            events.scheduledEventHandler.wipeScheduleForSession(sessionID);
        }

        // pmc
        pmcData._id = "pmc" + account.id;
        pmcData.aid = account.id;
        pmcData.savage = "scav" + account.id;
        pmcData.Info.Nickname = info.nickname;
        pmcData.Info.LowerNickname = info.nickname.toLowerCase();
        pmcData.Info.RegistrationDate = Math.floor(new Date() / 1000);
        pmcData.Health.UpdateTime = Math.round(Date.now() / 1000);

        // storage
        storage.data._id = "pmc" + account.id;

        // create profile
        json.write(folder + "character.json", pmcData);
        json.write(folder + "storage.json", storage);
        json.write(folder + "userbuilds.json", {});
        json.write(folder + "dialogue.json", {});

        // load to memory
        let profile = this.getProfile(account.id, "pmc");

        // traders
        for (let traderID in database_f.database.tables.traders)
        {
            trader_f.traderServer.resetTrader(account.id, traderID);
        }

        // don't wipe profile again
        account_f.accountServer.setWipe(account.id, false);
    }

    generateScav(sessionID)
    {
        const pmcData = this.getPmcProfile(sessionID);

        // get scav profile
        let scavProfiles = bots_f.botController.generate({ "conditions": [{ "Role": "playerScav", "Limit": 1, "Difficulty": "normal" }] });
        let scavData = scavProfiles[0];

        // add proper metadata
        scavData._id = pmcData.savage;
        scavData.aid = sessionID;
        scavData.Info.Settings = {};

        // remove secure container
        scavData = helpfunc_f.removeSecureContainer(scavData);

        // set cooldown timer
        scavData = this.setScavCooldownTimer(scavData, pmcData);

        // add scav to the profile
        this.profiles[sessionID]["scav"] = scavData;
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

    validateNickname(info, sessionID)
    {
        if (info.nickname.length < 3)
        {
            return "tooshort";
        }

        if (account_f.accountServer.nicknameTaken(info))
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
}

function getPmcPath(sessionID)
{
    let pmcPath = db.user.profiles.character;
    return pmcPath.replace("__REPLACEME__", sessionID);
}

class ProfileCallbacks
{
    constructor()
    {
        router.addStaticRoute("/client/game/profile/create", this.createProfile.bind());
        router.addStaticRoute("/client/game/profile/list", this.getProfileData.bind());
        router.addStaticRoute("/client/game/profile/savage/regenerate", this.regenerateScav.bind());
        router.addStaticRoute("/client/game/profile/voice/change", this.changeVoice.bind());
        router.addStaticRoute("/client/game/profile/nickname/change", this.changeNickname.bind());
        router.addStaticRoute("/client/game/profile/nickname/validate", this.validateNickname.bind());
        router.addStaticRoute("/client/game/profile/nickname/reserved", this.getReservedNickname.bind());
    }

    createProfile(url, info, sessionID)
    {
        profile_f.profileController.createProfile(info, sessionID);
        return response_f.getBody({"uid": "pmc" + sessionID});
    }

    getProfileData(url, info, sessionID)
    {
        return response_f.getBody(profile_f.profileController.getCompleteProfile(sessionID));
    }

    regenerateScav(url, info, sessionID)
    {
        return response_f.getBody([profile_f.profileController.generateScav(sessionID)]);
    }

    changeVoice(url, info, sessionID)
    {
        profile_f.profileController.changeVoice(info, sessionID);
        return response_f.nullResponse();
    }

    /// --- TODO: USE LOCALIZED STRINGS --- ///
    changeNickname(url, info, sessionID)
    {
        const output = profile_f.profileController.changeNickname(info, sessionID);

        if (output == "taken")
        {
            return response_f.getBody(null, 255, "The nickname is already in use");
        }

        if (output == "tooshort")
        {
            return response_f.getBody(null, 1, "The nickname is too short");
        }

        return response_f.getBody({"status": 0, "nicknamechangedate": Math.floor(new Date() / 1000)});
    }
    /// --- TODO: USE LOCALIZED STRINGS --- ///
    validateNickname(url, info, sessionID)
    {
        const output = profile_f.profileController.validateNickname(info, sessionID);

        if (output == "taken")
        {
            return response_f.getBody(null, 255, "The nickname is already in use");
        }

        if (output == "tooshort")
        {
            return response_f.getBody(null, 256, "The nickname is too short");
        }

        return response_f.getBody({"status": "ok"});
    }
    /// --- TODO: USE LOCALIZED STRINGS --- ///

    getReservedNickname(url, info, sessionID)
    {
        return response_f.getBody(account_f.accountServer.getReservedNickname(sessionID));
    }
}

module.exports.profileController = new ProfileController();
module.exports.profileCallbacks = new ProfileCallbacks();
