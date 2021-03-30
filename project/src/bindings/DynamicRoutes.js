const BotCallbacks = require("../callbacks/BotCallbacks");
const CustomizationCallbacks = require("../callbacks/CustomizationCallbacks");
const DataCallbacks = require("../callbacks/DataCallbacks");
const HttpCallbacks = require("../callbacks/HttpCallbacks");
const LocationCallbacks = require("../callbacks/LocationCallbacks");
const ModCallbacks = require("../callbacks/ModCallbacks");
const TraderCallbacks = require("../callbacks/TraderCallbacks");

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
    "/api/location": {
        "aki": LocationCallbacks.getLocation
    },
    "/client/location/getLocalloot": {
        "aki": LocationCallbacks.getLocationTest
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
