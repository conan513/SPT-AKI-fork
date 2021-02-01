// utils
const app = require("./utils/App");
const DatabaseImporter = require("./utils/DatabaseImporter");

// callbacks
const BotCallbacks = require("./callbacks/BotCallbacks");
const CertCallbacks = require("./callbacks/CertCallbacks");
const CustomizationCallbacks = require("./callbacks/CustomizationCallbacks");
const DataCallbacks = require("./callbacks/DataCallbacks");
const DialogueCallbacks = require("./callbacks/DialogueCallbacks");
const GameCallbacks = require("./callbacks/GameCallbacks");
const HealthCallbacks = require("./callbacks/HealthCallbacks");
const HideoutCallbacks = require("./callbacks/HideoutCallbacks");
const HttpCallbacks = require("./callbacks/HttpCallbacks");
const InraidCallbacks = require("./callbacks/InraidCallbacks");
const InsuranceCallbacks = require("./callbacks/InsuranceCallbacks");
const InventoryCallbacks = require("./callbacks/InventoryCallbacks");
const ItemEventCallbacks = require("./callbacks/ItemEventCallbacks");
const LauncherCallbacks = require("./callbacks/LauncherCallbacks");
const LocationCallbacks = require("./callbacks/LocationCallbacks");
const MatchCallbacks = require("./callbacks/MatchCallbacks");
const ModCallbacks = require("./callbacks/ModCallbacks");
const NoteCallbacks = require("./callbacks/NoteCallbacks");
const NotifierCallbacks = require("./callbacks/NotifierCallbacks");
const PresetBuildCallbacks = require("./callbacks/PresetBuildCallbacks");
const PresetCallbacks = require("./callbacks/PresetCallbacks");
const ProfileCallbacks = require("./callbacks/ProfileCallbacks");
const QuestCallbacks = require("./callbacks/QuestCallbacks");
const RagfairCallbacks = require("./callbacks/RagfairCallbacks");
const RepairCallbacks = require("./callbacks/RepairCallbacks");
const SaveCallbacks = require("./callbacks/SaveCallbacks");
const TradeCallbacks = require("./callbacks/TradeCallbacks");
const TraderCallbacks = require("./callbacks/TraderCallbacks");
const WeatherCallbacks = require("./callbacks/WeatherCallbacks");
const WishlistCallbacks = require("./callbacks/WishlistCallbacks");

// server load
app.onLoad = {
    "aki-database": DatabaseImporter.load.bind(DatabaseImporter),
    "aki-certs": CertCallbacks.load,
    "aki-https": HttpCallbacks.load,
    "aki-mods": ModCallbacks.load,
    "aki-presets": PresetCallbacks.load,
    "aki-ragfair": RagfairCallbacks.load,
    "aki-save": SaveCallbacks.load,
    "aki-traders": TraderCallbacks.load
};

// server update
app.onUpdate = {
    "aki-dialogue": DialogueCallbacks.update,
    "aki-hideout": HideoutCallbacks.update,
    "aki-insurance": InsuranceCallbacks.update,
    "aki-ragfair-offers": RagfairCallbacks.update,
    "aki-ragfair-player": RagfairCallbacks.updatePlayer,
    "aki-traders": TraderCallbacks.update
};

// saves load
save_f.server.onLoad = {
    "aki-health": HealthCallbacks.onLoad,
    "aki-inraid": InraidCallbacks.onLoad,
    "aki-insurance": InsuranceCallbacks.onLoad,
    "aki-profile": ProfileCallbacks.onLoad
};

// server respond
https_f.server.onRespond = {
    "CERT_BIN": CertCallbacks.sendBinary,
    "IMAGE": HttpCallbacks.sendImage,
    "BUNDLE": ModCallbacks.sendBundle,
    "SAVE": SaveCallbacks.save
}

// Static routes
https_f.router.addStaticRoute("/client/game/bot/generate", "Aki", BotCallbacks.generateBots);
https_f.router.addStaticRoute(CertCallbacks.endPoint, "Aki", CertCallbacks.registerBinary);
https_f.router.addStaticRoute("/client/trading/customization/storage", "Aki", CustomizationCallbacks.getSuits);
https_f.router.addStaticRoute("/client/globals", "Aki", DataCallbacks.getGlobals);
https_f.router.addStaticRoute("/client/items", "Aki", DataCallbacks.getTemplateItems);
https_f.router.addStaticRoute("/client/handbook/templates", "Aki", DataCallbacks.getTemplateHandbook);
https_f.router.addStaticRoute("/client/customization", "Aki", DataCallbacks.getTemplateSuits);
https_f.router.addStaticRoute("/client/account/customization", "Aki", DataCallbacks.getTemplateCharacter);
https_f.router.addStaticRoute("/client/hideout/production/recipes", "Aki", DataCallbacks.gethideoutProduction);
https_f.router.addStaticRoute("/client/hideout/settings", "Aki", DataCallbacks.getHideoutSettings);
https_f.router.addStaticRoute("/client/hideout/areas", "Aki", DataCallbacks.getHideoutAreas);
https_f.router.addStaticRoute("/client/hideout/production/scavcase/recipes", "Aki", DataCallbacks.getHideoutScavcase);
https_f.router.addStaticRoute("/client/languages", "Aki", DataCallbacks.getLocalesLanguages);
https_f.router.addDynamicRoute("/client/menu/locale/", "Aki", DataCallbacks.getLocalesMenu);
https_f.router.addDynamicRoute("/client/locale/", "Aki", DataCallbacks.getLocalesGlobal);
https_f.router.addStaticRoute("/client/friend/list", "Aki", DialogueCallbacks.getFriendList);
https_f.router.addStaticRoute("/client/chatServer/list", "Aki", DialogueCallbacks.getChatServerList);
https_f.router.addStaticRoute("/client/mail/dialog/list", "Aki", DialogueCallbacks.getMailDialogList);
https_f.router.addStaticRoute("/client/mail/dialog/view", "Aki", DialogueCallbacks.getMailDialogView);
https_f.router.addStaticRoute("/client/mail/dialog/info", "Aki", DialogueCallbacks.getMailDialogInfo);
https_f.router.addStaticRoute("/client/mail/dialog/remove", "Aki", DialogueCallbacks.removeDialog);
https_f.router.addStaticRoute("/client/mail/dialog/pin", "Aki", DialogueCallbacks.pinDialog);
https_f.router.addStaticRoute("/client/mail/dialog/unpin", "Aki", DialogueCallbacks.unpinDialog);
https_f.router.addStaticRoute("/client/mail/dialog/read", "Aki", DialogueCallbacks.setRead);
https_f.router.addStaticRoute("/client/mail/dialog/getAllAttachments", "Aki", DialogueCallbacks.getAllAttachments);
https_f.router.addStaticRoute("/client/friend/request/list/outbox", "Aki", DialogueCallbacks.listOutbox);
https_f.router.addStaticRoute("/client/friend/request/list/inbox", "Aki", DialogueCallbacks.listInbox);
https_f.router.addStaticRoute("/client/friend/request/send", "Aki", DialogueCallbacks.friendRequest);
https_f.router.addStaticRoute("/client/game/config", "Aki", GameCallbacks.getGameConfig);
https_f.router.addStaticRoute("/client/server/list", "Aki", GameCallbacks.getServer);
https_f.router.addStaticRoute("/client/game/version/validate", "Aki", GameCallbacks.versionValidate);
https_f.router.addStaticRoute("/client/game/start", "Aki", GameCallbacks.gameStart);
https_f.router.addStaticRoute("/client/game/logout", "Aki", GameCallbacks.gameLogout);
https_f.router.addStaticRoute("/client/checkVersion", "Aki", GameCallbacks.validateGameVersion);
https_f.router.addStaticRoute("/client/game/keepalive", "Aki", GameCallbacks.gameKeepalive);
https_f.router.addStaticRoute("/player/health/sync", "Aki", HealthCallbacks.syncHealth);
https_f.router.addStaticRoute("/raid/map/name", "Aki", InraidCallbacks.registerPlayer);
https_f.router.addStaticRoute("/raid/profile/save", "Aki", InraidCallbacks.saveProgress);
https_f.router.addStaticRoute("/singleplayer/settings/raid/endstate", "Aki", InraidCallbacks.getRaidEndState);
https_f.router.addStaticRoute("/singleplayer/settings/weapon/durability", "Aki", InraidCallbacks.getWeaponDurability);
https_f.router.addStaticRoute("/singleplayer/settings/raid/menu", "Aki", InraidCallbacks.getRaidMenuSettings);
https_f.router.addStaticRoute("/client/insurance/items/list/cost", "Aki", InsuranceCallbacks.getInsuranceCost);
https_f.router.addStaticRoute("/client/game/profile/items/moving", "Aki", ItemEventCallbacks.handleEvents);
https_f.router.addStaticRoute("/launcher/server/connect", "Aki", LauncherCallbacks.connect);
https_f.router.addStaticRoute("/launcher/profile/login", "Aki", LauncherCallbacks.login);
https_f.router.addStaticRoute("/launcher/profile/register", "Aki", LauncherCallbacks.register);
https_f.router.addStaticRoute("/launcher/profile/get", "Aki", LauncherCallbacks.get);
https_f.router.addStaticRoute("/launcher/profile/change/username", "Aki", LauncherCallbacks.changeUsername);
https_f.router.addStaticRoute("/launcher/profile/change/password", "Aki", LauncherCallbacks.changePassword);
https_f.router.addStaticRoute("/launcher/profile/change/wipe", "Aki", LauncherCallbacks.wipe);
https_f.router.addStaticRoute("/client/locations", "Aki", LocationCallbacks.getLocationData);
https_f.router.addStaticRoute("/client/friend/request/send", "Aki", MatchCallbacks.friendRequest);
https_f.router.addStaticRoute("/raid/profile/list", "Aki", MatchCallbacks.getProfile);
https_f.router.addStaticRoute("/client/match/available", "Aki", MatchCallbacks.serverAvailable);
https_f.router.addStaticRoute("/client/match/updatePing", "Aki", MatchCallbacks.updatePing);
https_f.router.addStaticRoute("/client/match/join", "Aki", MatchCallbacks.joinMatch);
https_f.router.addStaticRoute("/client/match/exit", "Aki", MatchCallbacks.exitMatch);
https_f.router.addStaticRoute("/client/match/group/create", "Aki", MatchCallbacks.createGroup);
https_f.router.addStaticRoute("/client/match/group/delete", "Aki", MatchCallbacks.deleteGroup);
https_f.router.addStaticRoute("/client/match/group/status", "Aki", MatchCallbacks.getGroupStatus);
https_f.router.addStaticRoute("/client/match/group/start_game", "Aki", MatchCallbacks.joinMatch);
https_f.router.addStaticRoute("/client/match/group/exit_from_menu", "Aki", MatchCallbacks.exitToMenu);
https_f.router.addStaticRoute("/client/match/group/looking/start", "Aki", MatchCallbacks.startGroupSearch);
https_f.router.addStaticRoute("/client/match/group/looking/stop", "Aki", MatchCallbacks.stopGroupSearch);
https_f.router.addStaticRoute("/client/match/group/invite/send", "Aki", MatchCallbacks.sendGroupInvite);
https_f.router.addStaticRoute("/client/match/group/invite/accept", "Aki", MatchCallbacks.acceptGroupInvite);
https_f.router.addStaticRoute("/client/match/group/invite/cancel", "Aki", MatchCallbacks.cancelGroupInvite);
https_f.router.addStaticRoute("/client/putMetrics", "Aki", MatchCallbacks.putMetrics);
https_f.router.addStaticRoute("/client/getMetricsConfig", "Aki", MatchCallbacks.getMetrics);
https_f.router.addStaticRoute("/singleplayer/bundles", "Aki", ModCallbacks.getBundles);
https_f.router.addStaticRoute("/client/notifier/channel/create", "Aki", NotifierCallbacks.createNotifierChannel);
https_f.router.addStaticRoute("/client/game/profile/select", "Aki", NotifierCallbacks.selectProfile);
https_f.router.addStaticRoute("/client/handbook/builds/my/list", "Aki", PresetBuildCallbacks.getHandbookUserlist);
https_f.router.addStaticRoute("/client/game/profile/create", "Aki", ProfileCallbacks.createProfile);
https_f.router.addStaticRoute("/client/game/profile/list", "Aki", ProfileCallbacks.getProfileData);
https_f.router.addStaticRoute("/client/game/profile/savage/regenerate", "Aki", ProfileCallbacks.regenerateScav);
https_f.router.addStaticRoute("/client/game/profile/nickname/change", "Aki", ProfileCallbacks.changeNickname);
https_f.router.addStaticRoute("/client/game/profile/nickname/validate", "Aki", ProfileCallbacks.validateNickname);
https_f.router.addStaticRoute("/client/game/profile/nickname/reserved", "Aki", ProfileCallbacks.getReservedNickname);
https_f.router.addStaticRoute("/client/profile/status", "Aki", ProfileCallbacks.getProfileStatus);
https_f.router.addStaticRoute("/client/quest/list", "Aki", QuestCallbacks.listQuests);
https_f.router.addStaticRoute("/client/ragfair/search", "Aki", RagfairCallbacks.search);
https_f.router.addStaticRoute("/client/ragfair/find", "Aki", RagfairCallbacks.search);
https_f.router.addStaticRoute("/client/ragfair/itemMarketPrice", "Aki", RagfairCallbacks.getMarketPrice);
https_f.router.addStaticRoute("/client/items/prices", "Aki", RagfairCallbacks.getItemPrices);
https_f.router.addStaticRoute("/client/trading/api/getTradersList", "Aki", TraderCallbacks.getTraderList);
https_f.router.addStaticRoute("/client/weather", "Aki", WeatherCallbacks.getWeather);

// Dynamic routes
https_f.router.addDynamicRoute("/singleplayer/settings/bot/limit/", "Aki", BotCallbacks.getBotLimit);
https_f.router.addDynamicRoute("/singleplayer/settings/bot/difficulty/", "Aki", BotCallbacks.getBotDifficulty);
https_f.router.addDynamicRoute("/client/trading/customization/", "Aki", CustomizationCallbacks.getTraderSuits);
https_f.router.addDynamicRoute(".jpg", "Aki", HttpCallbacks.getImage);
https_f.router.addDynamicRoute(".png", "Aki", HttpCallbacks.getImage);
https_f.router.addDynamicRoute("/api/location", "Aki", LocationCallbacks.getLocation);
https_f.router.addDynamicRoute(".bundle", "Aki", ModCallbacks.getBundle);
https_f.router.addDynamicRoute("/client/trading/api/getUserAssortPrice/trader/", "Aki", TraderCallbacks.getProfilePurchases);
https_f.router.addDynamicRoute("/client/trading/api/getTrader/", "Aki", TraderCallbacks.getTrader);
https_f.router.addDynamicRoute("/client/trading/api/getTraderAssort/", "Aki", TraderCallbacks.getAssort);

// client/game/item/moving request event
item_f.eventHandler.addEvent("CustomizationWear", "Aki", CustomizationCallbacks.wearClothing);
item_f.eventHandler.addEvent("CustomizationBuy", "Aki", CustomizationCallbacks.buyClothing);
item_f.eventHandler.addEvent("Eat", "Aki", HealthCallbacks.offraidEat);
item_f.eventHandler.addEvent("Heal", "Aki", HealthCallbacks.offraidHeal);
item_f.eventHandler.addEvent("RestoreHealth", "Aki", HealthCallbacks.healthTreatment);
item_f.eventHandler.addEvent("HideoutUpgrade", "Aki", HideoutCallbacks.upgrade);
item_f.eventHandler.addEvent("HideoutUpgradeComplete", "Aki", HideoutCallbacks.upgradeComplete);
item_f.eventHandler.addEvent("HideoutPutItemsInAreaSlots", "Aki", HideoutCallbacks.putItemsInAreaSlots);
item_f.eventHandler.addEvent("HideoutTakeItemsFromAreaSlots", "Aki", HideoutCallbacks.takeItemsFromAreaSlots);
item_f.eventHandler.addEvent("HideoutToggleArea", "Aki", HideoutCallbacks.toggleArea);
item_f.eventHandler.addEvent("HideoutSingleProductionStart", "Aki", HideoutCallbacks.singleProductionStart);
item_f.eventHandler.addEvent("HideoutScavCaseProductionStart", "Aki", HideoutCallbacks.scavCaseProductionStart);
item_f.eventHandler.addEvent("HideoutContinuousProductionStart", "Aki", HideoutCallbacks.continuousProductionStart);
item_f.eventHandler.addEvent("HideoutTakeProduction", "Aki", HideoutCallbacks.takeProduction);
item_f.eventHandler.addEvent("Insure", "Aki", InsuranceCallbacks.insure);
item_f.eventHandler.addEvent("Move", "Aki", InventoryCallbacks.moveItem);
item_f.eventHandler.addEvent("Remove", "Aki", InventoryCallbacks.removeItem);
item_f.eventHandler.addEvent("Split", "Aki", InventoryCallbacks.splitItem);
item_f.eventHandler.addEvent("Merge", "Aki", InventoryCallbacks.mergeItem);
item_f.eventHandler.addEvent("Transfer", "Aki", InventoryCallbacks.transferItem);
item_f.eventHandler.addEvent("Swap", "Aki", InventoryCallbacks.swapItem);
item_f.eventHandler.addEvent("Fold", "Aki", InventoryCallbacks.foldItem);
item_f.eventHandler.addEvent("Toggle", "Aki", InventoryCallbacks.toggleItem);
item_f.eventHandler.addEvent("Tag", "Aki", InventoryCallbacks.tagItem);
item_f.eventHandler.addEvent("Bind", "Aki", InventoryCallbacks.bindItem);
item_f.eventHandler.addEvent("Examine", "Aki", InventoryCallbacks.examineItem);
item_f.eventHandler.addEvent("ReadEncyclopedia", "Aki", InventoryCallbacks.readEncyclopedia);
item_f.eventHandler.addEvent("ApplyInventoryChanges", "Aki", InventoryCallbacks.sortInventory);
item_f.eventHandler.addEvent("AddNote", "Aki", NoteCallbacks.addNote);
item_f.eventHandler.addEvent("EditNote", "Aki", NoteCallbacks.editNote);
item_f.eventHandler.addEvent("DeleteNote", "Aki", NoteCallbacks.deleteNote);
item_f.eventHandler.addEvent("SaveBuild", "Aki", PresetBuildCallbacks.saveBuild);
item_f.eventHandler.addEvent("RemoveBuild", "Aki", PresetBuildCallbacks.removeBuild);
item_f.eventHandler.addEvent("QuestAccept", "Aki", QuestCallbacks.acceptQuest);
item_f.eventHandler.addEvent("QuestComplete", "Aki", QuestCallbacks.completeQuest);
item_f.eventHandler.addEvent("QuestHandover", "Aki", QuestCallbacks.handoverQuest);
item_f.eventHandler.addEvent("RagFairAddOffer", "Aki", RagfairCallbacks.addOffer);
item_f.eventHandler.addEvent("RagFairRemoveOffer", "Aki", RagfairCallbacks.removeOffer);
item_f.eventHandler.addEvent("RagFairRenewOffer", "Aki", RagfairCallbacks.extendOffer);
item_f.eventHandler.addEvent("Repair", "Aki", RepairCallbacks.repair);
item_f.eventHandler.addEvent("TradingConfirm", "Aki", TradeCallbacks.processTrade);
item_f.eventHandler.addEvent("RagFairBuyOffer", "Aki", TradeCallbacks.processRagfairTrade);
item_f.eventHandler.addEvent("AddToWishList", "Aki", WishlistCallbacks.addToWishlist);
item_f.eventHandler.addEvent("RemoveFromWishList", "Aki", WishlistCallbacks.removeFromWishlist);
