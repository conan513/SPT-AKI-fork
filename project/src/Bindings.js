// utils
const App = require("./utils/App");
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
App.onLoad = {
    "aki-database": DatabaseImporter.load,
    "aki-certs": CertCallbacks.load,
    "aki-https": HttpCallbacks.load,
    "aki-mods": ModCallbacks.load,
    "aki-presets": PresetCallbacks.load,
    "aki-ragfair": RagfairCallbacks.load,
    "aki-save": SaveCallbacks.load,
    "aki-traders": TraderCallbacks.load
};

// server update
App.onUpdate = {
    "aki-dialogue": DialogueCallbacks.update,
    "aki-hideout": HideoutCallbacks.update,
    "aki-insurance": InsuranceCallbacks.update,
    "aki-ragfair-offers": RagfairCallbacks.update,
    "aki-ragfair-player": RagfairCallbacks.updatePlayer,
    "aki-traders": TraderCallbacks.update
},

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
};

// Static routes
https_f.router.onStaticRoute = {
    "/client/game/bot/generate": {
        "aki": BotCallbacks.generateBots
    },
    "/certs/get": {
        "aki": CertCallbacks.registerBinary
    },
    "/client/trading/customization/storage": {
        "aki": CustomizationCallbacks.getSuits
    },
    "/client/globals": {
        "aki": DataCallbacks.getGlobals
    },
    "/client/items": {
        "aki": DataCallbacks.getTemplateItems
    },
    "/client/handbook/templates": {
        "aki": DataCallbacks.getTemplateHandbook
    },
    "/client/customization": {
        "aki": DataCallbacks.getTemplateSuits
    },
    "/client/account/customization": {
        "aki": DataCallbacks.getTemplateCharacter
    },
    "/client/hideout/production/recipes": {
        "aki": DataCallbacks.gethideoutProduction
    },
    "/client/hideout/settings": {
        "aki": DataCallbacks.getHideoutSettings
    },
    "/client/hideout/areas": {
        "aki": DataCallbacks.getHideoutAreas
    },
    "/client/hideout/production/scavcase/recipes": {
        "aki": DataCallbacks.getHideoutScavcase
    },
    "/client/languages": {
        "aki": DataCallbacks.getLocalesLanguages
    },
    "/client/friend/list": {
        "aki": DialogueCallbacks.getFriendList
    },
    "/client/chatServer/list": {
        "aki": DialogueCallbacks.getChatServerList
    },
    "/client/mail/dialog/list": {
        "aki": DialogueCallbacks.getMailDialogList
    },
    "/client/mail/dialog/view": {
        "aki": DialogueCallbacks.getMailDialogView
    },
    "/client/mail/dialog/info": {
        "aki": DialogueCallbacks.getMailDialogInfo
    },
    "/client/mail/dialog/remove": {
        "aki": DialogueCallbacks.removeDialog
    },
    "/client/mail/dialog/pin": {
        "aki": DialogueCallbacks.pinDialog
    },
    "/client/mail/dialog/unpin": {
        "aki": DialogueCallbacks.unpinDialog
    },
    "/client/mail/dialog/read": {
        "aki": DialogueCallbacks.setRead
    },
    "/client/mail/dialog/getAllAttachments": {
        "aki": DialogueCallbacks.getAllAttachments
    },
    "/client/friend/request/list/outbox": {
        "aki": DialogueCallbacks.listOutbox
    },
    "/client/friend/request/list/inbox": {
        "aki": DialogueCallbacks.listInbox
    },
    "/client/friend/request/send": {
        "aki": DialogueCallbacks.friendRequest
    },
    "/client/game/config": {
        "aki": GameCallbacks.getGameConfig
    },
    "/client/server/list": {
        "aki": GameCallbacks.getServer
    },
    "/client/game/version/validate": {
        "aki": GameCallbacks.versionValidate
    },
    "/client/game/start": {
        "aki": GameCallbacks.gameStart
    },
    "/client/game/logout": {
        "aki": GameCallbacks.gameLogout
    },
    "/client/checkVersion": {
        "aki": GameCallbacks.validateGameVersion
    },
    "/client/game/keepalive": {
        "aki": GameCallbacks.gameKeepalive
    },
    "/player/health/sync": {
        "aki": HealthCallbacks.syncHealth
    },
    "/raid/map/name": {
        "aki": InraidCallbacks.registerPlayer
    },
    "/raid/profile/save": {
        "aki": InraidCallbacks.saveProgress
    },
    "/singleplayer/settings/raid/endstate": {
        "aki": InraidCallbacks.getRaidEndState
    },
    "/singleplayer/settings/weapon/durability": {
        "aki": InraidCallbacks.getWeaponDurability
    },
    "/singleplayer/settings/raid/menu": {
        "aki": InraidCallbacks.getRaidMenuSettings
    },
    "/client/insurance/items/list/cost": {
        "aki": InsuranceCallbacks.getInsuranceCost
    },
    "/client/game/profile/items/moving": {
        "aki": ItemEventCallbacks.handleEvents
    },
    "/launcher/server/connect": {
        "aki": LauncherCallbacks.connect
    },
    "/launcher/profile/login": {
        "aki": LauncherCallbacks.login
    },
    "/launcher/profile/register": {
        "aki": LauncherCallbacks.register
    },
    "/launcher/profile/get": {
        "aki": LauncherCallbacks.get
    },
    "/launcher/profile/change/username": {
        "aki": LauncherCallbacks.changeUsername
    },
    "/launcher/profile/change/password": {
        "aki": LauncherCallbacks.changePassword
    },
    "/launcher/profile/change/wipe": {
        "aki": LauncherCallbacks.wipe
    },
    "/client/locations": {
        "aki": LocationCallbacks.getLocationData
    },
    "/raid/profile/list": {
        "aki": MatchCallbacks.getProfile
    },
    "/client/match/available": {
        "aki": MatchCallbacks.serverAvailable
    },
    "/client/match/updatePing": {
        "aki": MatchCallbacks.updatePing
    },
    "/client/match/join": {
        "aki": MatchCallbacks.joinMatch
    },
    "/client/match/exit": {
        "aki": MatchCallbacks.exitMatch
    },
    "/client/match/group/create": {
        "aki": MatchCallbacks.createGroup
    },
    "/client/match/group/delete": {
        "aki": MatchCallbacks.deleteGroup
    },
    "/client/match/group/status": {
        "aki": MatchCallbacks.getGroupStatus
    },
    "/client/match/group/start_game": {
        "aki": MatchCallbacks.joinMatch
    },
    "/client/match/group/exit_from_menu": {
        "aki": MatchCallbacks.exitToMenu
    },
    "/client/match/group/looking/start": {
        "aki": MatchCallbacks.startGroupSearch
    },
    "/client/match/group/looking/stop": {
        "aki": MatchCallbacks.stopGroupSearch
    },
    "/client/match/group/invite/send": {
        "aki": MatchCallbacks.sendGroupInvite
    },
    "/client/match/group/invite/accept": {
        "aki": MatchCallbacks.acceptGroupInvite
    },
    "/client/match/group/invite/cancel": {
        "aki": MatchCallbacks.cancelGroupInvite
    },
    "/client/putMetrics": {
        "aki": MatchCallbacks.putMetrics
    },
    "/client/getMetricsConfig": {
        "aki": MatchCallbacks.getMetrics
    },
    "/singleplayer/bundles": {
        "aki": ModCallbacks.getBundles
    },
    "/client/notifier/channel/create": {
        "aki": NotifierCallbacks.createNotifierChannel
    },
    "/client/game/profile/select": {
        "aki": NotifierCallbacks.selectProfile
    },
    "/client/handbook/builds/my/list": {
        "aki": PresetBuildCallbacks.getHandbookUserlist
    },
    "/client/game/profile/create": {
        "aki": ProfileCallbacks.createProfile
    },
    "/client/game/profile/list": {
        "aki": ProfileCallbacks.getProfileData
    },
    "/client/game/profile/savage/regenerate": {
        "aki": ProfileCallbacks.regenerateScav
    },
    "/client/game/profile/nickname/change": {
        "aki": ProfileCallbacks.changeNickname
    },
    "/client/game/profile/nickname/validate": {
        "aki": ProfileCallbacks.validateNickname
    },
    "/client/game/profile/nickname/reserved": {
        "aki": ProfileCallbacks.getReservedNickname
    },
    "/client/profile/status": {
        "aki": ProfileCallbacks.getProfileStatus
    },
    "/client/quest/list": {
        "aki": QuestCallbacks.listQuests
    },
    "/client/ragfair/search": {
        "aki": RagfairCallbacks.search
    },
    "/client/ragfair/find": {
        "aki": RagfairCallbacks.search
    },
    "/client/ragfair/itemMarketPrice": {
        "aki": RagfairCallbacks.getMarketPrice
    },
    "/client/items/prices": {
        "aki": RagfairCallbacks.getItemPrices
    },
    "/client/trading/api/getTradersList": {
        "aki": TraderCallbacks.getTraderList
    },
    "/client/weather": {
        "aki": WeatherCallbacks.getWeather
    },
};

// Dynamic routes
https_f.router.onDynamicRoute = {
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

// client/game/item/moving request event
item_f.eventHandler.onEvent = {
    "CustomizationWear": {
        "aki": CustomizationCallbacks.wearClothing
    },
    "CustomizationBuy": {
        "aki": CustomizationCallbacks.buyClothing
    },
    "Eat": {
        "aki": HealthCallbacks.offraidEat
    },
    "Heal": {
        "aki": HealthCallbacks.offraidHeal
    },
    "RestoreHealth": {
        "aki": HealthCallbacks.healthTreatment
    },
    "HideoutUpgrade": {
        "aki": HideoutCallbacks.upgrade
    },
    "HideoutUpgradeComplete": {
        "aki": HideoutCallbacks.upgradeComplete
    },
    "HideoutPutItemsInAreaSlots": {
        "aki": HideoutCallbacks.putItemsInAreaSlots
    },
    "HideoutTakeItemsFromAreaSlots": {
        "aki": HideoutCallbacks.takeItemsFromAreaSlots
    },
    "HideoutToggleArea": {
        "aki": HideoutCallbacks.toggleArea
    },
    "HideoutSingleProductionStart": {
        "aki": HideoutCallbacks.singleProductionStart
    },
    "HideoutScavCaseProductionStart": {
        "aki": HideoutCallbacks.scavCaseProductionStart
    },
    "HideoutContinuousProductionStart": {
        "aki": HideoutCallbacks.continuousProductionStart
    },
    "HideoutTakeProduction": {
        "aki": HideoutCallbacks.takeProduction
    },
    "Insure": {
        "aki": InsuranceCallbacks.insure
    },
    "Move": {
        "aki": InventoryCallbacks.moveItem
    },
    "Remove": {
        "aki": InventoryCallbacks.removeItem
    },
    "Split": {
        "aki": InventoryCallbacks.splitItem
    },
    "Merge": {
        "aki": InventoryCallbacks.mergeItem
    },
    "Transfer": {
        "aki": InventoryCallbacks.transferItem
    },
    "Swap": {
        "aki": InventoryCallbacks.swapItem
    },
    "Fold": {
        "aki": InventoryCallbacks.foldItem
    },
    "Toggle": {
        "aki": InventoryCallbacks.toggleItem
    },
    "Tag": {
        "aki": InventoryCallbacks.tagItem
    },
    "Bind": {
        "aki": InventoryCallbacks.bindItem
    },
    "Examine": {
        "aki": InventoryCallbacks.examineItem
    },
    "ReadEncyclopedia": {
        "aki": InventoryCallbacks.readEncyclopedia
    },
    "ApplyInventoryChanges": {
        "aki": InventoryCallbacks.sortInventory
    },
    "AddNote": {
        "aki": NoteCallbacks.addNote
    },
    "EditNote": {
        "aki": NoteCallbacks.editNote
    },
    "DeleteNote": {
        "aki": NoteCallbacks.deleteNote
    },
    "SaveBuild": {
        "aki": PresetBuildCallbacks.saveBuild
    },
    "RemoveBuild": {
        "aki": PresetBuildCallbacks.removeBuild
    },
    "QuestAccept": {
        "aki": QuestCallbacks.acceptQuest
    },
    "QuestComplete": {
        "aki": QuestCallbacks.completeQuest
    },
    "QuestHandover": {
        "aki": QuestCallbacks.handoverQuest
    },
    "RagFairAddOffer": {
        "aki": RagfairCallbacks.addOffer
    },
    "RagFairRemoveOffer": {
        "aki": RagfairCallbacks.removeOffer
    },
    "RagFairRenewOffer": {
        "aki": RagfairCallbacks.extendOffer
    },
    "Repair": {
        "aki": RepairCallbacks.repair
    },
    "TradingConfirm": {
        "aki": TradeCallbacks.processTrade
    },
    "RagFairBuyOffer": {
        "aki": TradeCallbacks.processRagfairTrade
    },
    "AddToWishList": {
        "aki": WishlistCallbacks.addToWishlist
    },
    "RemoveFromWishList": {
        "aki": WishlistCallbacks.removeFromWishlist
    }
};
