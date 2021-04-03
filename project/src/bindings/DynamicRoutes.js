"use strict";

require("../Lib.js");

module.exports = {
    "/client/menu/locale/": {
        "aki": DataCallbacks.getLocalesMenu
    },
    "/client/locale/": {
        "aki": DataCallbacks.getLocalesGlobal
    },
    "/singleplayer/settings/bot/limit/": {
        "aki": BotCallbacks.getBotLimit
    },
    "/singleplayer/settings/bot/difficulty/": {
        "aki": BotCallbacks.getBotDifficulty
    },
    "/client/trading/customization/": {
        "aki": CustomizationCallbacks.getTraderSuits
    },
    ".jpg": {
        "aki": HttpCallbacks.getImage
    },
    ".png": {
        "aki": HttpCallbacks.getImage
    },
    "/client/location/getLocalloot": {
        "aki": LocationCallbacks.getLocation
    },
    "/raid/map/name": {
        "aki": InraidCallbacks.registerPlayer
    },
    ".bundle": {
        "aki": ModCallbacks.getBundle
    },
    "/client/trading/api/getUserAssortPrice/trader/": {
        "aki": TraderCallbacks.getProfilePurchases
    },
    "/client/trading/api/getTrader/": {
        "aki": TraderCallbacks.getTrader
    },
    "/client/trading/api/getTraderAssort/": {
        "aki": TraderCallbacks.getAssort
    }
};
