// utils
globalThis.DatabaseImporter = require("./utils/DatabaseImporter.js");
globalThis.HashUtil = require("./utils/HashUtil.js");
globalThis.HttpResponse = require("./utils/HttpResponse.js");
globalThis.JsonUtil = require("./utils/JsonUtil.js");
globalThis.Logger = require("./utils/Logger.js");
globalThis.RandomUtil = require("./utils/RandomUtil.js");
globalThis.VFS = require("./utils/VFS.js");
globalThis.TimeUtil = require("./utils/TimeUtil.js");

// others
globalThis.Mods = require("./controllers/ModController.js");

// Helpers
globalThis.ContainerHelper = require("./Helpers/ContainerHelper.js");
globalThis.InventoryHelper = require("./Helpers/InventoryHelper.js");
globalThis.ItemHelper = require("./Helpers/ItemHelper.js");
globalThis.PlzRefactorMeHelper = require("./Helpers/PlzRefactorMeHelper.js");
globalThis.QuestHelper = require("./Helpers/QuestHelper.js");

// generators
globalThis.BotGenerator = require("./generators/BotGenerator.js");
globalThis.LocationGenerator = require("./generators/LocationGenerator.js");

// configs
globalThis.BotConfig = require("./configs/Botconfig.js");
globalThis.HealthConfig = require("./configs/Healthconfig.js");
globalThis.HideoutConfig = require("./configs/Hideoutconfig.js");
globalThis.HttpConfig = require("./configs/Httpconfig.js");
globalThis.InraidConfig = require("./configs/Inraidconfig.js");
globalThis.InsuranceConfig = require("./configs/Insuranceconfig.js");
globalThis.InventoryConfig = require("./configs/Inventoryconfig.js");
globalThis.LocationConfig = require("./configs/Locationconfig.js");
globalThis.MatchConfig = require("./configs/Matchconfig.js");
globalThis.QuestConfig = require("./configs/Questconfig.js");
globalThis.RagfairConfig = require("./configs/Ragfairconfig.js");
globalThis.RepairConfig = require("./configs/Repairconfig.js");
globalThis.TraderConfig = require("./configs/Traderconfig.js");
globalThis.WeatherConfig = require("./configs/Weatherconfig.js");

// callbacks
globalThis.BotCallbacks = require("./callbacks/BotCallbacks.js");
globalThis.CertController = require("./controllers/CertController.js");
globalThis.CertCallbacks = require("./callbacks/CertCallbacks.js");
globalThis.CustomizationCallbacks = require("./callbacks/CustomizationCallbacks.js");
globalThis.DataCallbacks = require("./callbacks/DataCallbacks.js");
globalThis.DialogueCallbacks = require("./callbacks/DialogueCallbacks.js");
globalThis.GameCallbacks = require("./callbacks/GameCallbacks.js");
globalThis.HealthCallbacks = require("./callbacks/HealthCallbacks.js");
globalThis.HideoutCallbacks = require("./callbacks/HideoutCallbacks.js");
globalThis.HttpCallbacks = require("./callbacks/HttpCallbacks.js");
globalThis.InraidCallbacks = require("./callbacks/InraidCallbacks.js");
globalThis.InsuranceCallbacks = require("./callbacks/InsuranceCallbacks.js");
globalThis.InventoryCallbacks = require("./callbacks/InventoryCallbacks.js");
globalThis.ItemEventCallbacks = require("./callbacks/ItemEventCallbacks.js");
globalThis.LauncherCallbacks = require("./callbacks/LauncherCallbacks.js");
globalThis.LocationCallbacks = require("./callbacks/LocationCallbacks.js");
globalThis.MatchCallbacks = require("./callbacks/MatchCallbacks.js");
globalThis.ModCallbacks = require("./callbacks/ModCallbacks.js");
globalThis.NoteCallbacks = require("./callbacks/NoteCallbacks.js");
globalThis.NotifierCallbacks = require("./callbacks/NotifierCallbacks.js");
globalThis.PresetBuildCallbacks = require("./callbacks/PresetBuildCallbacks.js");
globalThis.PresetCallbacks = require("./callbacks/PresetCallbacks.js");
globalThis.ProfileCallbacks = require("./callbacks/ProfileCallbacks.js");
globalThis.QuestCallbacks = require("./callbacks/QuestCallbacks.js");
globalThis.RagfairCallbacks = require("./callbacks/RagfairCallbacks.js");
globalThis.RepairCallbacks = require("./callbacks/RepairCallbacks.js");
globalThis.SaveCallbacks = require("./callbacks/SaveCallbacks.js");
globalThis.TradeCallbacks = require("./callbacks/TradeCallbacks.js");
globalThis.TraderCallbacks = require("./callbacks/TraderCallbacks.js");
globalThis.WeatherCallbacks = require("./callbacks/WeatherCallbacks.js");
globalThis.WishlistCallbacks = require("./callbacks/WishlistCallbacks.js");

// controllers
globalThis.BotController = require("./controllers/BotController.js");
globalThis.CustomizationController = require("./controllers/CustomizationController.js");
globalThis.DialogueController = require("./controllers/DialogueController.js");
globalThis.HealthController = require("./controllers/HealthController.js");
globalThis.HideoutController = require("./controllers/HideoutController.js");
globalThis.InraidController = require("./controllers/InraidController.js");
globalThis.InsuranceController = require("./controllers/InsuranceController.js");
globalThis.InventoryController = require("./controllers/InventoryController.js");
globalThis.LauncherController = require("./controllers/LauncherController.js");
globalThis.LocationController = require("./controllers/LocationController.js");
globalThis.MatchController = require("./controllers/MatchController.js");
globalThis.NoteController = require("./controllers/NoteController.js");
globalThis.NotifierController = require("./controllers/NotifierController.js");
globalThis.PresetBuildController = require("./controllers/PresetBuildController.js");
globalThis.PresetController = require("./controllers/PresetController.js");
globalThis.ProfileController = require("./controllers/ProfileController.js");
globalThis.QuestController = require("./controllers/QuestController.js");
globalThis.RagfairController = require("./controllers/RagfairController.js");
globalThis.RepairController = require("./controllers/RepairController.js");
globalThis.TradeController = require("./controllers/TradeController.js");
globalThis.TraderController = require("./controllers/TraderController.js");
globalThis.WeatherController = require("./controllers/WeatherController.js");
globalThis.WishlistController = require("./controllers/WishlistController.js");

// servers
globalThis.DatabaseServer = require("./servers/DatabaseServer.js");
globalThis.HttpServer = require("./servers/HttpServer.js");
globalThis.RagfairServer = require("./servers/RagfairServer.js");
globalThis.SaveServer = require("./servers/SaveServer.js");

// routers
globalThis.HttpRouter = require("./routers/HttpRouter.js");
globalThis.ImageRouter = require("./routers/ImageRouter.js");
globalThis.ItemEventRouter = require("./routers/ItemEventRouter.js");