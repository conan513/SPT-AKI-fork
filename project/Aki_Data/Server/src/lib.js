// common_f

global["common_f"] = {
    "vfs": require("./utils/VFS.js"),
    "json": require("./utils/JsonUtil.js"),
    "hash": require("./utils/HashUtil.js"),
    "time": require("./utils/TimeUtil.js"),
    "logger": require("./utils/Logger.js")
};

global["certs_f"] = {
    "controller": require("./controllers/CertController.js"),
    "callbacks": require("./callbacks/CertCallbacks.js")
};

global["https_f"] = {
    // code here
};

global["database_f"] = {
    "server": require("./servers/DatabaseServer.js")
};

global["item_f"] = {
    "eventHandler": require("./controllers/ItemEventController.js"),
    "callbacks": require("./callbacks/ItemEventCallbacks.js")
};

global["save_f"] = {
    "server": require("./server/SaveServer.js"),
    "callbacks": require("./callbacks/SaveCallbacks.js")
};

global["health_f"] = {
    "config": require("./configs/HealthConfig.js"),
    "controller": require("./controllers/HealthController.js"),
    "callbacks": require("./callbacks/HealthCallbacks.js")
};

global["inraid_f"] = {
    "config": require("./configs/InraidConfig.js"),
    "controller": require("./controllers/InraidController.js"),
    "callbacks": require("./callbacks/InraidCallbacks.js")
};

global["dialogue_f"] = {
    "controller": require("./controllers/DialogueController.js"),
    "callbacks": require("./callbacks/DialogueCallbacks.js")
};

global["account_f"] = {
    "controller": require("./controllers/LauncherController.js"),
    "callbacks": require("./callbacks/LauncherCallbacks.js")
};

global["profile_f"] = {
    "controller": require("./controllers/ProfileController.js"),
    "callbacks": require("./callbacks/ProfileCallbacks.js")
};

global["notifier_f"] = {
    "controller": require("./controllers/NotifierController.js"),
    "callbacks": require("./callbacks/NotifierCallbacks.js")
};

global["bots_f"] = {
    "config": require("./configs/BotConfig.js"),
    "controller": require("./controllers/BotController.js"),
    "generator": require("./controllers/BotGenerator.js"),
    "callbacks": require("./callbacks/BotCallbacks.js")
};

global["helpfunc_f"] = {
    "helpFunctions": require("./helpers/PlzRefactorMeHelper.js"),
};

global["quest_f"] = {
    // code here
};

global["note_f"] = {
    // code here
};

global["inventory_f"] = {
    // code here
};

global["wishList_f"] = {
    // code here
};

global["trade_f"] = {
    "controller": require("./controllers/TradeController.js"),
    "callbacks": require("./callbacks/TradeCallbacks.js")
};

global["customization_f"] = {
    "controller": require("./controllers/CustomizationController.js"),
    "callbacks": require("./callbacks/CustomizationCallbacks.js")
};

global["hideout_f"] = {
    "config": require("./configs/HideoutConfig.js"),
    "controller": require("./controllers/HideoutController.js"),
    "callbacks": require("./callbacks/HideoutCallbacks.js")
};

global["weaponbuilds_f"] = {
    "controller": require("./controllers/PresetBuildController.js"),
    "callbacks": require("./callbacks/PresetBuildCallbacks.js")
};

global["repair_f"] = {
    "config": require("./configs/RepairConfig.js"),
    "controller": require("./controllers/RepairController.js"),
    "callbacks": require("./callbacks/RepairCallbacks.js")
};

global["insurance_f"] = {
    "config": require("./configs/InsuranceConfig.js"),
    "controller": require("./controllers/InsuranceController.js"),
    "callbacks": require("./callbacks/InsuranceCallbacks.js")
};

global["trader_f"] = {
    "config": require("./configs/TraderConfig.js"),
    "controller": require("./controllers/TraderController.js"),
    "callbacks": require("./callbacks/TraderCallbacks.js")
};

global["preset_f"] = {
    "controller": require("./controllers/PresetController.js"),
    "callbacks": require("./callbacks/PresetCallbacks.js")
};

global["ragfair_f"] = {
    "config": require("./configs/RagfairConfig.js"),
    "server": require("./configs/RagfairServer.js"),
    "controller": require("./controllers/RagfairController.js"),
    "callbacks": require("./callbacks/RagfairCallbacks.js")
};

global["weather_f"] = {
    "config": require("./configs/WeatherConfig.js"),
    "controller": require("./controllers/WeatherController.js"),
    "callbacks": require("./callbacks/WeatherCallbacks.js")
};

global["location_f"] = {
    "config": require("./configs/LocationConfig.js"),
    "controller": require("./controllers/LocationController.js"),
    "generator": require("./controllers/LocationGenerator.js"),
    "callbacks": require("./callbacks/LocationCallbacks.js")
};

global["match_f"] = {
    "config": require("./configs/MatchConfig.js"),
    "controller": require("./controllers/MatchController.js"),
    "callbacks": require("./callbacks/MatchCallbacks.js")
};

// single callbacks
// <eft-startup>
// <eft-database>

// modding
global["mods_f"] = {
    "loader": require("./controllers/ModController.js"),
    "callbacks": require("./callbacks/ModCallbacks.js")
};
