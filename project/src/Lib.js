globalThis.JsonUtil = require("./utils/JsonUtil");
globalThis.HashUtil = require("./utils/HashUtil");
globalThis.RandomUtil = require("./utils/RandomUtil");
globalThis.TimeUtil = require("./utils/TimeUtil");
globalThis.Logger = require("./utils/Logger");
globalThis.Helpers = require("./helpers/PlzRefactorMeHelper");
globalThis.ItemHelper = require("./helpers/ItemHelper");
globalThis.InventoryHelper = require("./helpers/InventoryHelper");
globalThis.ContainerHelper = require("./helpers/ContainerHelper");
globalThis.Mods = require("./controllers/ModController");

globalThis["https_f"] = {
    "response": require("./utils/HttpResponse.js"),
    "server": require("./servers/HttpServer.js")
};

globalThis["database_f"] = {
    "server": require("./servers/DatabaseServer.js")
};

globalThis["item_f"] = {
    "eventHandler": require("./routers/ItemEventRouter.js")
};

globalThis["save_f"] = {
    "server": require("./servers/SaveServer.js")
};

globalThis["inraid_f"] = {
    "config": require("./configs/InraidConfig.json"),
    "controller": require("./controllers/InraidController.js")
};

globalThis["dialogue_f"] = {
    "controller": require("./controllers/DialogueController.js")
};

globalThis["profile_f"] = {
    "controller": require("./controllers/ProfileController.js")
};

globalThis["notifier_f"] = {
    "controller": require("./controllers/NotifierController.js")
};

globalThis["bots_f"] = {
    "config": require("./configs/BotConfig.json"),
    "controller": require("./controllers/BotController.js"),
    "generator": require("./generators/BotGenerator.js")
};

globalThis["quest_f"] = {
    "config": require("./configs/QuestConfig.json"),
    "helpers": require("./helpers/QuestHelpers.js"),
    "controller": require("./controllers/QuestController.js")
};

globalThis["inventory_f"] = {
    "config": require("./configs/InventoryConfig.json"),
    "controller": require("./controllers/InventoryController.js")
};

globalThis["trade_f"] = {
    "controller": require("./controllers/TradeController.js")
};

globalThis["hideout_f"] = {
    "config": require("./configs/HideoutConfig.json"),
    "controller": require("./controllers/HideoutController.js")
};

globalThis["weaponbuilds_f"] = {
    "controller": require("./controllers/PresetBuildController.js")
};

globalThis["insurance_f"] = {
    "config": require("./configs/InsuranceConfig.json"),
    "controller": require("./controllers/InsuranceController.js")
};

globalThis["trader_f"] = {
    "config": require("./configs/TraderConfig.json"),
    "controller": require("./controllers/TraderController.js")
};

globalThis["preset_f"] = {
    "controller": require("./controllers/PresetController.js")
};

globalThis["ragfair_f"] = {
    "config": require("./configs/RagfairConfig.json"),
    "server": require("./servers/RagfairServer.js"),
    "controller": require("./controllers/RagfairController.js")
};

globalThis["location_f"] = {
    "config": require("./configs/LocationConfig.json"),
    "controller": require("./controllers/LocationController.js"),
    "generator": require("./generators/LocationGenerator.js")
};
