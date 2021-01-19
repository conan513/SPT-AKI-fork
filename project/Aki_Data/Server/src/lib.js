globalThis["common_f"] = {
    "vfs": require("./utils/VFS.js"),
    "json": require("./utils/JsonUtil.js"),
    "hash": require("./utils/HashUtil.js"),
    "random": require("./utils/RandomUtil.js"),
    "time": require("./utils/TimeUtil.js"),
    "logger": require("./utils/Logger.js")
};

globalThis["certs_f"] = {
    "controller": require("./controllers/CertController.js"),
    "callbacks": require("./callbacks/CertCallbacks.js")
};

globalThis["https_f"] = {
    "config": require("./configs/HttpConfig.json"),
    "response": require("./utils/HttpResponse.js"),
    "router": require("./routers/HttpRouter.js"),
    "image": require("./routers/ImageRouter.js"),
    "server": require("./servers/HttpServer.js"),
    "callbacks": require("./callbacks/HttpCallbacks.js")
};

globalThis["database_f"] = {
    "server": require("./servers/DatabaseServer.js"),
    "importScript": require("./utils/DatabaseImporter.js")
};

globalThis["item_f"] = {
    "eventHandler": require("./routers/ItemEventRouter.js"),
    "callbacks": require("./callbacks/ItemEventCallbacks.js")
};

globalThis["save_f"] = {
    "server": require("./servers/SaveServer.js"),
    "callbacks": require("./callbacks/SaveCallbacks.js")
};

globalThis["health_f"] = {
    "config": require("./configs/HealthConfig.json"),
    "controller": require("./controllers/HealthController.js"),
    "callbacks": require("./callbacks/HealthCallbacks.js")
};

globalThis["inraid_f"] = {
    "config": require("./configs/InraidConfig.json"),
    "controller": require("./controllers/InraidController.js"),
    "callbacks": require("./callbacks/InraidCallbacks.js")
};

globalThis["dialogue_f"] = {
    "controller": require("./controllers/DialogueController.js"),
    "callbacks": require("./callbacks/DialogueCallbacks.js")
};

globalThis["account_f"] = {
    "controller": require("./controllers/LauncherController.js"),
    "callbacks": require("./callbacks/LauncherCallbacks.js")
};

globalThis["profile_f"] = {
    "controller": require("./controllers/ProfileController.js"),
    "callbacks": require("./callbacks/ProfileCallbacks.js")
};

globalThis["notifier_f"] = {
    "controller": require("./controllers/NotifierController.js"),
    "callbacks": require("./callbacks/NotifierCallbacks.js")
};

globalThis["bots_f"] = {
    "config": require("./configs/BotConfig.json"),
    "controller": require("./controllers/BotController.js"),
    "generator": require("./generators/BotGenerator.js"),
    "callbacks": require("./callbacks/BotCallbacks.js")
};

globalThis["helpfunc_f"] = {
    "helpFunctions": require("./helpers/PlzRefactorMeHelper.js"),
};

globalThis["quest_f"] = {
    "config": require("./configs/QuestConfig.json"),
    "helpers": require("./helpers/QuestHelpers.js"),
    "controller": require("./controllers/QuestController.js"),
    "callbacks": require("./callbacks/QuestCallbacks.js")
};

globalThis["note_f"] = {
    "controller": require("./controllers/NoteController.js"),
    "callbacks": require("./callbacks/NoteCallbacks.js")
};

globalThis["inventory_f"] = {
    "config": require("./configs/InventoryConfig.json"),
    "controller": require("./controllers/InventoryController.js"),
    "callbacks": require("./callbacks/InventoryCallbacks.js")
};

globalThis["wishList_f"] = {
    "controller": require("./controllers/WishlistController.js"),
    "callbacks": require("./callbacks/WishlistCallbacks.js")
};

globalThis["trade_f"] = {
    "controller": require("./controllers/TradeController.js"),
    "callbacks": require("./callbacks/TradeCallbacks.js")
};

globalThis["customization_f"] = {
    "controller": require("./controllers/CustomizationController.js"),
    "callbacks": require("./callbacks/CustomizationCallbacks.js")
};

globalThis["hideout_f"] = {
    "config": require("./configs/HideoutConfig.json"),
    "controller": require("./controllers/HideoutController.js"),
    "callbacks": require("./callbacks/HideoutCallbacks.js")
};

globalThis["weaponbuilds_f"] = {
    "controller": require("./controllers/PresetBuildController.js"),
    "callbacks": require("./callbacks/PresetBuildCallbacks.js")
};

globalThis["repair_f"] = {
    "config": require("./configs/RepairConfig.json"),
    "controller": require("./controllers/RepairController.js"),
    "callbacks": require("./callbacks/RepairCallbacks.js")
};

globalThis["insurance_f"] = {
    "config": require("./configs/InsuranceConfig.json"),
    "controller": require("./controllers/InsuranceController.js"),
    "callbacks": require("./callbacks/InsuranceCallbacks.js")
};

globalThis["trader_f"] = {
    "config": require("./configs/TraderConfig.json"),
    "controller": require("./controllers/TraderController.js"),
    "callbacks": require("./callbacks/TraderCallbacks.js")
};

globalThis["preset_f"] = {
    "controller": require("./controllers/PresetController.js"),
    "callbacks": require("./callbacks/PresetCallbacks.js")
};

globalThis["ragfair_f"] = {
    "config": require("./configs/RagfairConfig.json"),
    "server": require("./servers/RagfairServer.js"),
    "controller": require("./controllers/RagfairController.js"),
    "callbacks": require("./callbacks/RagfairCallbacks.js")
};

globalThis["weather_f"] = {
    "config": require("./configs/WeatherConfig.json"),
    "controller": require("./controllers/WeatherController.js"),
    "callbacks": require("./callbacks/WeatherCallbacks.js")
};

globalThis["location_f"] = {
    "config": require("./configs/LocationConfig.json"),
    "controller": require("./controllers/LocationController.js"),
    "generator": require("./generators/LocationGenerator.js"),
    "callbacks": require("./callbacks/LocationCallbacks.js")
};

globalThis["match_f"] = {
    "config": require("./configs/MatchConfig.json"),
    "controller": require("./controllers/MatchController.js"),
    "callbacks": require("./callbacks/MatchCallbacks.js")
};

globalThis["mods_f"] = {
    "loader": require("./controllers/ModController.js"),
    "callbacks": require("./callbacks/ModCallbacks.js")
};
