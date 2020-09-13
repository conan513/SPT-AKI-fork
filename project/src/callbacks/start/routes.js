"use strict";

function load()
{
    db.user.profiles = {
        "character": "user/profiles/__REPLACEME__/character.json",
        "dialogue": "user/profiles/__REPLACEME__/dialogue.json",
        "storage": "user/profiles/__REPLACEME__/storage.json",
        "userbuilds": "user/profiles/__REPLACEME__/userbuilds.json"
    };

    db.user.configs.accounts = "user/configs/accounts.json";
    db.user.configs.gameplay = "user/configs/gameplay.json";
}

server.addStartCallback("routeMissing", load);