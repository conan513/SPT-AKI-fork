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
    "aki-certs": CertCallbacks.load.bind(CertCallbacks),
    "aki-https": HttpCallbacks.load.bind(HttpCallbacks),
    "aki-mods": ModCallbacks.load.bind(ModCallbacks),
    "aki-presets": PresetCallbacks.load.bind(PresetCallbacks),
    "aki-ragfair": RagfairCallbacks.load.bind(RagfairCallbacks),
    "aki-save": SaveCallbacks.load.bind(SaveCallbacks),
    "aki-traders": TraderCallbacks.load.bind(TraderCallbacks)
};

// server update
app.onUpdate = {
    "aki-dialogue": DialogueCallbacks.update.bind(DialogueCallbacks),
    "aki-hideout": HideoutCallbacks.update.bind(HideoutCallbacks),
    "aki-insurance": InsuranceCallbacks.update.bind(InsuranceCallbacks),
    "aki-ragfair-offers": RagfairCallbacks.update.bind(RagfairCallbacks),
    "aki-ragfair-player": RagfairCallbacks.updatePlayer.bind(RagfairCallbacks),
    "aki-traders": TraderCallbacks.update.bind(TraderCallbacks)
},

// saves load
save_f.server.onLoad = {
    "aki-health": HealthCallbacks.onLoad.bind(HealthCallbacks),
    "aki-inraid": InraidCallbacks.onLoad.bind(InraidCallbacks),
    "aki-insurance": InsuranceCallbacks.onLoad.bind(InsuranceCallbacks),
    "aki-profile": ProfileCallbacks.onLoad.bind(ProfileCallbacks)
};

// server respond
https_f.server.onRespond = {
    "CERT_BIN": CertCallbacks.sendBinary.bind(CertCallbacks),
    "IMAGE": HttpCallbacks.sendImage.bind(HttpCallbacks),
    "BUNDLE": ModCallbacks.sendBundle.bind(ModCallbacks),
    "SAVE": SaveCallbacks.save.bind(SaveCallbacks)
};

// Static routes
https_f.router.onStaticRoute = {
    "/client/game/bot/generate": {
        "aki": BotCallbacks.generateBots.bind(BotCallbacks)
    },
    "/client/trading/customization/storage": {
        "aki": CustomizationCallbacks.getSuits.bind(CustomizationCallbacks)
    },
    "/client/globals": {
        "aki": DataCallbacks.getGlobals.bind(DataCallbacks)
    },
    "/client/items": {
        "aki": DataCallbacks.getTemplateItems.bind(DataCallbacks)
    },
    "/client/handbook/templates": {
        "aki": DataCallbacks.getTemplateHandbook.bind(DataCallbacks)
    },
    "/client/customization": {
        "aki": DataCallbacks.getTemplateSuits.bind(DataCallbacks)
    },
    "/client/account/customization": {
        "aki": DataCallbacks.getTemplateCharacter.bind(DataCallbacks)
    },
    "/client/hideout/production/recipes": {
        "aki": DataCallbacks.gethideoutProduction.bind(DataCallbacks)
    },
    "/client/hideout/settings": {
        "aki": DataCallbacks.getHideoutSettings.bind(DataCallbacks)
    },
    "/client/hideout/areas": {
        "aki": DataCallbacks.getHideoutAreas.bind(DataCallbacks)
    },
    "/client/hideout/production/scavcase/recipes": {
        "aki": DataCallbacks.getHideoutScavcase.bind(DataCallbacks)
    },
    "/client/languages": {
        "aki": DataCallbacks.getLocalesLanguages.bind(DataCallbacks)
    },
    "/client/friend/list": {
        "aki": DialogueCallbacks.getFriendList.bind(DialogueCallbacks)
    },
    "/client/chatServer/list": {
        "aki": DialogueCallbacks.getChatServerList.bind(DialogueCallbacks)
    },
    "/client/mail/dialog/list": {
        "aki": DialogueCallbacks.getMailDialogList.bind(DialogueCallbacks)
    },
    "/client/mail/dialog/view": {
        "aki": DialogueCallbacks.getMailDialogView.bind(DialogueCallbacks)
    },
    "/client/mail/dialog/info": {
        "aki": DialogueCallbacks.getMailDialogInfo.bind(DialogueCallbacks)
    },
    "/client/mail/dialog/remove": {
        "aki": DialogueCallbacks.removeDialog.bind(DialogueCallbacks)
    },
    "/client/mail/dialog/pin": {
        "aki": DialogueCallbacks.pinDialog.bind(DialogueCallbacks)
    },
    "/client/mail/dialog/unpin": {
        "aki": DialogueCallbacks.unpinDialog.bind(DialogueCallbacks)
    },
    "/client/mail/dialog/read": {
        "aki": DialogueCallbacks.setRead.bind(DialogueCallbacks)
    },
    "/client/mail/dialog/getAllAttachments": {
        "aki": DialogueCallbacks.getAllAttachments.bind(DialogueCallbacks)
    },
    "/client/friend/request/list/outbox": {
        "aki": DialogueCallbacks.listOutbox.bind(DialogueCallbacks)
    },
    "/client/friend/request/list/inbox": {
        "aki": DialogueCallbacks.listInbox.bind(DialogueCallbacks)
    },
    "/client/friend/request/send": {
        "aki": DialogueCallbacks.friendRequest.bind(DialogueCallbacks)
    },
    "/client/game/config": {
        "aki": GameCallbacks.getGameConfig.bind(GameCallbacks)
    },
    "/client/server/list": {
        "aki": GameCallbacks.getServer.bind(GameCallbacks)
    },
    "/client/game/version/validate": {
        "aki": GameCallbacks.versionValidate.bind(GameCallbacks)
    },
    "/client/game/start": {
        "aki": GameCallbacks.gameStart.bind(GameCallbacks)
    },
    "/client/game/logout": {
        "aki": GameCallbacks.gameLogout.bind(GameCallbacks)
    },
    "/client/checkVersion": {
        "aki": GameCallbacks.validateGameVersion.bind(GameCallbacks)
    },
    "/client/game/keepalive": {
        "aki": GameCallbacks.gameKeepalive.bind(GameCallbacks)
    },
    "/player/health/sync": {
        "aki": HealthCallbacks.syncHealth.bind(HealthCallbacks)
    },
    "/raid/map/name": {
        "aki": InraidCallbacks.registerPlayer.bind(InraidCallbacks)
    },
    "/raid/profile/save": {
        "aki": InraidCallbacks.saveProgress.bind(InraidCallbacks)
    },
    "/singleplayer/settings/raid/endstate": {
        "aki": InraidCallbacks.getRaidEndState.bind(InraidCallbacks)
    },
    "/singleplayer/settings/weapon/durability": {
        "aki": InraidCallbacks.getWeaponDurability.bind(InraidCallbacks)
    },
    "/singleplayer/settings/raid/menu": {
        "aki": InraidCallbacks.getRaidMenuSettings.bind(InraidCallbacks)
    },
    "/client/insurance/items/list/cost": {
        "aki": InsuranceCallbacks.getInsuranceCost.bind(InsuranceCallbacks)
    },
    "/client/game/profile/items/moving": {
        "aki": ItemEventCallbacks.handleEvents.bind(ItemEventCallbacks)
    },
    "/launcher/server/connect": {
        "aki": LauncherCallbacks.connect.bind(LauncherCallbacks)
    },
    "/launcher/profile/login": {
        "aki": LauncherCallbacks.login.bind(LauncherCallbacks)
    },
    "/launcher/profile/register": {
        "aki": LauncherCallbacks.register.bind(LauncherCallbacks)
    },
    "/launcher/profile/get": {
        "aki": LauncherCallbacks.get.bind(LauncherCallbacks)
    },
    "/launcher/profile/change/username": {
        "aki": LauncherCallbacks.changeUsername.bind(LauncherCallbacks)
    },
    "/launcher/profile/change/password": {
        "aki": LauncherCallbacks.changePassword.bind(LauncherCallbacks)
    },
    "/launcher/profile/change/wipe": {
        "aki": LauncherCallbacks.wipe.bind(LauncherCallbacks)
    },
    "/client/locations": {
        "aki": LocationCallbacks.getLocationData.bind(LocationCallbacks)
    },
    "/raid/profile/list": {
        "aki": MatchCallbacks.getProfile.bind(MatchCallbacks)
    },
    "/client/match/available": {
        "aki": MatchCallbacks.serverAvailable.bind(MatchCallbacks)
    },
    "/client/match/updatePing": {
        "aki": MatchCallbacks.updatePing.bind(MatchCallbacks)
    },
    "/client/match/join": {
        "aki": MatchCallbacks.joinMatch.bind(MatchCallbacks)
    },
    "/client/match/exit": {
        "aki": MatchCallbacks.exitMatch.bind(MatchCallbacks)
    },
    "/client/match/group/create": {
        "aki": MatchCallbacks.createGroup.bind(MatchCallbacks)
    },
    "/client/match/group/delete": {
        "aki": MatchCallbacks.deleteGroup.bind(MatchCallbacks)
    },
    "/client/match/group/status": {
        "aki": MatchCallbacks.getGroupStatus.bind(MatchCallbacks)
    },
    "/client/match/group/start_game": {
        "aki": MatchCallbacks.joinMatch.bind(MatchCallbacks)
    },
    "/client/match/group/exit_from_menu": {
        "aki": MatchCallbacks.exitToMenu.bind(MatchCallbacks)
    },
    "/client/match/group/looking/start": {
        "aki": MatchCallbacks.startGroupSearch.bind(MatchCallbacks)
    },
    "/client/match/group/looking/stop": {
        "aki": MatchCallbacks.stopGroupSearch.bind(MatchCallbacks)
    },
    "/client/match/group/invite/send": {
        "aki": MatchCallbacks.sendGroupInvite.bind(MatchCallbacks)
    },
    "/client/match/group/invite/accept": {
        "aki": MatchCallbacks.acceptGroupInvite.bind(MatchCallbacks)
    },
    "/client/match/group/invite/cancel": {
        "aki": MatchCallbacks.cancelGroupInvite.bind(MatchCallbacks)
    },
    "/client/putMetrics": {
        "aki": MatchCallbacks.putMetrics.bind(MatchCallbacks)
    },
    "/client/getMetricsConfig": {
        "aki": MatchCallbacks.getMetrics.bind(MatchCallbacks)
    },
    "/singleplayer/bundles": {
        "aki": ModCallbacks.getBundles.bind(MatchCallbacks)
    },
    "/client/notifier/channel/create": {
        "aki": NotifierCallbacks.createNotifierChannel.bind(NoteCallbacks)
    },
    "/client/game/profile/select": {
        "aki": NotifierCallbacks.selectProfile.bind(NoteCallbacks)
    },
    "/client/handbook/builds/my/list": {
        "aki": PresetBuildCallbacks.getHandbookUserlist.bind(PresetBuildCallbacks)
    },
    "/client/game/profile/create": {
        "aki": ProfileCallbacks.createProfile.bind(ProfileCallbacks)
    },
    "/client/game/profile/list": {
        "aki": ProfileCallbacks.getProfileData.bind(ProfileCallbacks)
    },
    "/client/game/profile/savage/regenerate": {
        "aki": ProfileCallbacks.regenerateScav.bind(ProfileCallbacks)
    },
    "/client/game/profile/nickname/change": {
        "aki": ProfileCallbacks.changeNickname.bind(ProfileCallbacks)
    },
    "/client/game/profile/nickname/validate": {
        "aki": ProfileCallbacks.validateNickname.bind(ProfileCallbacks)
    },
    "/client/game/profile/nickname/reserved": {
        "aki": ProfileCallbacks.getReservedNickname.bind(ProfileCallbacks)
    },
    "/client/profile/status": {
        "aki": ProfileCallbacks.getProfileStatus.bind(ProfileCallbacks)
    },
    "/client/quest/list": {
        "aki": QuestCallbacks.listQuests.bind(QuestCallbacks)
    },
    "/client/ragfair/search": {
        "aki": RagfairCallbacks.search.bind(RagfairCallbacks)
    },
    "/client/ragfair/find": {
        "aki": RagfairCallbacks.search.bind(RagfairCallbacks)
    },
    "/client/ragfair/itemMarketPrice": {
        "aki": RagfairCallbacks.getMarketPrice.bind(RagfairCallbacks)
    },
    "/client/items/prices": {
        "aki": RagfairCallbacks.getItemPrices.bind(RagfairCallbacks)
    },
    "/client/trading/api/getTradersList": {
        "aki": TraderCallbacks.getTraderList.bind(TraderCallbacks)
    },
    "/client/weather": {
        "aki": WeatherCallbacks.getWeather.bind(WeatherCallbacks)
    },
};

https_f.router.onStaticRoute[CertCallbacks.endPoint] = {
    "aki": CertCallbacks.registerBinary.bind(CertCallbacks)
},

// Dynamic routes
https_f.router.onDynamicRoute = {
    "/client/menu/locale/": {
        "aki": DataCallbacks.getLocalesMenu.bind(DataCallbacks)
    },
    "/client/locale/": {
        "aki": DataCallbacks.getLocalesGlobal.bind(DataCallbacks)
    },
    "/singleplayer/settings/bot/limit/": {
        "aki": BotCallbacks.getBotLimit.bind(BotCallbacks)
    },
    "/singleplayer/settings/bot/difficulty/": {
        "aki": BotCallbacks.getBotDifficulty.bind(BotCallbacks)
    },
    "/client/trading/customization/": {
        "aki": CustomizationCallbacks.getTraderSuits.bind(CustomizationCallbacks)
    },
    ".jpg": {
        "aki": HttpCallbacks.getImage.bind(HttpCallbacks)
    },
    ".png": {
        "aki": HttpCallbacks.getImage.bind(HttpCallbacks)
    },
    "/api/location": {
        "aki": LocationCallbacks.getLocation.bind(LocationCallbacks)
    },
    ".bundle": {
        "aki": ModCallbacks.getBundle.bind(ModCallbacks)
    },
    "/client/trading/api/getUserAssortPrice/trader/": {
        "aki": TraderCallbacks.getProfilePurchases.bind(TraderCallbacks)
    },
    "/client/trading/api/getTrader/": {
        "aki": TraderCallbacks.getTrader.bind(TraderCallbacks)
    },
    "/client/trading/api/getTraderAssort/": {
        "aki": TraderCallbacks.getAssort.bind(TraderCallbacks)
    }
};

// client/game/item/moving request event
item_f.eventHandler.onEvent = {
    "CustomizationWear": {
        "aki": CustomizationCallbacks.wearClothing.bind(CustomizationCallbacks)
    },
    "CustomizationBuy": {
        "aki": CustomizationCallbacks.buyClothing.bind(CustomizationCallbacks)
    },
    "Eat": {
        "aki": HealthCallbacks.offraidEat.bind(HealthCallbacks)
    },
    "Heal": {
        "aki": HealthCallbacks.offraidHeal.bind(HealthCallbacks)
    },
    "RestoreHealth": {
        "aki": HealthCallbacks.healthTreatment.bind(HealthCallbacks)
    },
    "HideoutUpgrade": {
        "aki": HideoutCallbacks.upgrade.bind(HideoutCallbacks)
    },
    "HideoutUpgradeComplete": {
        "aki": HideoutCallbacks.upgradeComplete.bind(HideoutCallbacks)
    },
    "HideoutPutItemsInAreaSlots": {
        "aki": HideoutCallbacks.putItemsInAreaSlots.bind(HideoutCallbacks)
    },
    "HideoutTakeItemsFromAreaSlots": {
        "aki": HideoutCallbacks.takeItemsFromAreaSlots.bind(HideoutCallbacks)
    },
    "HideoutToggleArea": {
        "aki": HideoutCallbacks.toggleArea.bind(HideoutCallbacks)
    },
    "HideoutSingleProductionStart": {
        "aki": HideoutCallbacks.singleProductionStart.bind(HideoutCallbacks)
    },
    "HideoutScavCaseProductionStart": {
        "aki": HideoutCallbacks.scavCaseProductionStart.bind(HideoutCallbacks)
    },
    "HideoutContinuousProductionStart": {
        "aki": HideoutCallbacks.continuousProductionStart.bind(HideoutCallbacks)
    },
    "HideoutTakeProduction": {
        "aki": HideoutCallbacks.takeProduction.bind(HideoutCallbacks)
    },
    "Insure": {
        "aki": InsuranceCallbacks.insure.bind(InsuranceCallbacks)
    },
    "Move": {
        "aki": InventoryCallbacks.moveItem.bind(InventoryCallbacks)
    },
    "Remove": {
        "aki": InventoryCallbacks.removeItem.bind(InventoryCallbacks)
    },
    "Split": {
        "aki": InventoryCallbacks.splitItem.bind(InventoryCallbacks)
    },
    "Merge": {
        "aki": InventoryCallbacks.mergeItem.bind(InventoryCallbacks)
    },
    "Transfer": {
        "aki": InventoryCallbacks.transferItem.bind(InventoryCallbacks)
    },
    "Swap": {
        "aki": InventoryCallbacks.swapItem.bind(InventoryCallbacks)
    },
    "Fold": {
        "aki": InventoryCallbacks.foldItem.bind(InventoryCallbacks)
    },
    "Toggle": {
        "aki": InventoryCallbacks.toggleItem.bind(InventoryCallbacks)
    },
    "Tag": {
        "aki": InventoryCallbacks.tagItem.bind(InventoryCallbacks)
    },
    "Bind": {
        "aki": InventoryCallbacks.bindItem.bind(InventoryCallbacks)
    },
    "Examine": {
        "aki": InventoryCallbacks.examineItem.bind(InventoryCallbacks)
    },
    "ReadEncyclopedia": {
        "aki": InventoryCallbacks.readEncyclopedia.bind(InventoryCallbacks)
    },
    "ApplyInventoryChanges": {
        "aki": InventoryCallbacks.sortInventory.bind(InventoryCallbacks)
    },
    "AddNote": {
        "aki": NoteCallbacks.addNote.bind(NoteCallbacks)
    },
    "EditNote": {
        "aki": NoteCallbacks.editNote.bind(NoteCallbacks)
    },
    "DeleteNote": {
        "aki": NoteCallbacks.deleteNote.bind(NoteCallbacks)
    },
    "SaveBuild": {
        "aki": PresetBuildCallbacks.saveBuild.bind(PresetBuildCallbacks)
    },
    "RemoveBuild": {
        "aki": PresetBuildCallbacks.removeBuild.bind(PresetBuildCallbacks)
    },
    "QuestAccept": {
        "aki": QuestCallbacks.acceptQuest.bind(QuestCallbacks)
    },
    "QuestComplete": {
        "aki": QuestCallbacks.completeQuest.bind(QuestCallbacks)
    },
    "QuestHandover": {
        "aki": QuestCallbacks.handoverQuest.bind(QuestCallbacks)
    },
    "RagFairAddOffer": {
        "aki": RagfairCallbacks.addOffer.bind(RagfairCallbacks)
    },
    "RagFairRemoveOffer": {
        "aki": RagfairCallbacks.removeOffer.bind(RagfairCallbacks)
    },
    "RagFairRenewOffer": {
        "aki": RagfairCallbacks.extendOffer.bind(RagfairCallbacks)
    },
    "Repair": {
        "aki": RepairCallbacks.repair.bind(RepairCallbacks)
    },
    "TradingConfirm": {
        "aki": TradeCallbacks.processTrade.bind(TradeCallbacks)
    },
    "RagFairBuyOffer": {
        "aki": TradeCallbacks.processRagfairTrade.bind(TradeCallbacks)
    },
    "AddToWishList": {
        "aki": WishlistCallbacks.addToWishlist.bind(WishlistCallbacks)
    },
    "RemoveFromWishList": {
        "aki": WishlistCallbacks.removeFromWishlist.bind(WishlistCallbacks)
    }
};
