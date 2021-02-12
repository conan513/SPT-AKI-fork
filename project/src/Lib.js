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

globalThis["item_f"] = {
    "eventHandler": require("./routers/ItemEventRouter.js")
};

globalThis["save_f"] = {
    "server": require("./servers/SaveServer.js")
};

globalThis["inraid_f"] = {
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
    "controller": require("./controllers/BotController.js"),
    "generator": require("./generators/BotGenerator.js")
};

globalThis["quest_f"] = {
    "helpers": require("./helpers/QuestHelpers.js"),
    "controller": require("./controllers/QuestController.js")
};

globalThis["inventory_f"] = {
    "controller": require("./controllers/InventoryController.js")
};

globalThis["trade_f"] = {
    "controller": require("./controllers/TradeController.js")
};

globalThis["hideout_f"] = {
    "controller": require("./controllers/HideoutController.js")
};

globalThis["weaponbuilds_f"] = {
    "controller": require("./controllers/PresetBuildController.js")
};

globalThis["insurance_f"] = {
    "controller": require("./controllers/InsuranceController.js")
};

globalThis["trader_f"] = {
    "controller": require("./controllers/TraderController.js")
};

globalThis["preset_f"] = {
    "controller": require("./controllers/PresetController.js")
};

globalThis["ragfair_f"] = {
    "server": require("./servers/RagfairServer.js"),
    "controller": require("./controllers/RagfairController.js")
};

globalThis["location_f"] = {
    "controller": require("./controllers/LocationController.js"),
    "generator": require("./generators/LocationGenerator.js")
};
