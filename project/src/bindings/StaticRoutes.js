const BotCallbacks = require("../callbacks/BotCallbacks");
const CertCallbacks = require("../callbacks/CertCallbacks");
const CustomizationCallbacks = require("../callbacks/CustomizationCallbacks");
const DataCallbacks = require("../callbacks/DataCallbacks");
const DialogueCallbacks = require("../callbacks/DialogueCallbacks");
const GameCallbacks = require("../callbacks/GameCallbacks");
const HealthCallbacks = require("../callbacks/HealthCallbacks");
const InraidCallbacks = require("../callbacks/InraidCallbacks");
const InsuranceCallbacks = require("../callbacks/InsuranceCallbacks");
const ItemEventCallbacks = require("../callbacks/ItemEventCallbacks");
const LauncherCallbacks = require("../callbacks/LauncherCallbacks");
const LocationCallbacks = require("../callbacks/LocationCallbacks");
const MatchCallbacks = require("../callbacks/MatchCallbacks");
const ModCallbacks = require("../callbacks/ModCallbacks");
const NotifierCallbacks = require("../callbacks/NotifierCallbacks");
const PresetBuildCallbacks = require("../callbacks/PresetBuildCallbacks");
const ProfileCallbacks = require("../callbacks/ProfileCallbacks");
const QuestCallbacks = require("../callbacks/QuestCallbacks");
const RagfairCallbacks = require("../callbacks/RagfairCallbacks");
const TraderCallbacks = require("../callbacks/TraderCallbacks");
const WeatherCallbacks = require("../callbacks/WeatherCallbacks");

module.exports = {
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
    }
};
