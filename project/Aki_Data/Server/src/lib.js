global["common_f"] = {
    "vfs": require("./utils/VFS.js"),
    "json": require("./utils/JsonUtil.js"),
    "hash": require("./utils/HashUtil.js"),
    "random": require("./utils/RandomUtil.js"),
    "time": require("./utils/TimeUtil.js"),
    "logger": require("./utils/Logger.js")
};

global["certs_f"] = {
    "controller": require("./controllers/CertController.js"),
    "callbacks": require("./callbacks/CertCallbacks.js")
};

global["https_f"] = {
    "config": require("./configs/HttpConfig.js"),
    "response": require("./utils/HttpResponse.js"),
    "router": require("./routers/HttpRouter.js"),
    "image": require("./routers/ImageRouter.js"),
    "server": require("./servers/HttpServer.js"),
    "callbacks": require("./callbacks/HttpCallbacks.js")
};

global["database_f"] = {
    "server": require("./servers/DatabaseServer.js"),
    "importScript": require("./utils/DatabaseImporter.js")
};

global["item_f"] = {
    "eventHandler": require("./routers/ItemEventRouter.js"),
    "callbacks": require("./callbacks/ItemEventCallbacks.js")
};

global["save_f"] = {
    "server": require("./servers/SaveServer.js"),
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
    "generator": require("./generators/BotGenerator.js"),
    "callbacks": require("./callbacks/BotCallbacks.js")
};

global["helpfunc_f"] = {
    "helpFunctions": require("./helpers/PlzRefactorMeHelper.js"),
};

global["quest_f"] = {
    "config": require("./configs/QuestConfig.js"),
    "helpers": require("./helpers/QuestHelpers.js"),
    "controller": require("./controllers/QuestController.js"),
    "callbacks": require("./callbacks/QuestCallbacks.js")
};

global["note_f"] = {
    "controller": require("./controllers/NoteController.js"),
    "callbacks": require("./callbacks/NoteCallbacks.js")
};

global["inventory_f"] = {
    "config": require("./configs/InventoryConfig.js"),
    "controller": require("./controllers/InventoryController.js"),
    "callbacks": require("./callbacks/InventoryCallbacks.js")
};

global["wishList_f"] = {
    "controller": require("./controllers/WishlistController.js"),
    "callbacks": require("./callbacks/WishlistCallbacks.js")
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
    "server": require("./servers/RagfairServer.js"),
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
    "generator": require("./generators/LocationGenerator.js"),
    "callbacks": require("./callbacks/LocationCallbacks.js")
};

global["match_f"] = {
    "config": require("./configs/MatchConfig.js"),
    "controller": require("./controllers/MatchController.js"),
    "callbacks": require("./callbacks/MatchCallbacks.js")
};

global["mods_f"] = {
    "loader": require("./controllers/ModController.js"),
    "callbacks": require("./callbacks/ModCallbacks.js")
};
