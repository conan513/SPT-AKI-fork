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
        db.user.configs.gameplay = "user/configs/gameplay.json";
    }
}

module.exports.routesCallbacks = new RoutesCallbacks();
