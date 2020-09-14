"use strict";

// TODO: remove this
class RoutesCallbacks
{
    constructor()
    {
        server.addStartCallback("routeMissing", this.load.bind());
    }

    load()
    {
        db.user.configs.accounts = "user/configs/accounts.json";
        db.user.configs.gameplay = "user/configs/gameplay.json";
        db.user.profiles = {
            "character": "user/profiles/__REPLACEME__/character.json",
            "dialogue": "user/profiles/__REPLACEME__/dialogue.json",
            "suits": "user/profiles/__REPLACEME__/storage.json",
            "weaponbuilds": "user/profiles/__REPLACEME__/userbuilds.json"
        };
    }
}

module.exports.routesCallbacks = new RoutesCallbacks();
