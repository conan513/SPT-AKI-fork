declare var core_f: akiCore_f;
declare var common_f: akiCommon_f;
declare var certs_f: akiPackage;
declare var https_f: akiPackage;
//declare var database_f: akiPackage;
declare var keepalive_f: akiPackage;
declare var item_f: akiPackage;
declare var eft_database_f: akiPackage;
declare var eft_startup_f: akiPackage;
declare var save_f: akiPackage;
declare var health_f: akiPackage;
declare var inraid_f: akiPackage;
declare var dialogue_f: akiPackage;
declare var account_f: akiPackage;
declare var profile_f: akiPackage;
declare var notifier_f: akiPackage;
declare var bots_f: akiPackage;
declare var helpfunc_f: akiPackage;
declare var quest_f: akiPackage;
declare var note_f: akiPackage;
declare var inventory_f: akiPackage;
declare var wishList_f: akiPackage;
declare var trade_f: akiPackage;
declare var customization_f: akiPackage;
declare var hideout_f: akiPackage;
declare var weaponbuilds_f: akiPackage;
declare var repair_f: akiPackage;
declare var insurance_f: akiPackage;
declare var trader_f: akiPackage;
declare var preset_f: akiPackage;
declare var ragfair_f: akiPackage;
declare var weather_f: akiPackage;
declare var location_f: akiPackage;
declare var match_f: akiPackage;
declare var additions_f: akiPackage;
declare var mods_f: akiPackage;

declare var pkgs: Record<string, akiPackage>;

interface pkgThing {

}
interface akiPkgLookup {

}
interface akiPackage {
    helpFunctions: any;
    eventHandler: any;
    server: any;
    controller: any;
    callback: any;
    helpers: any;
    config: akiConfig;
    time: any;

}

interface akiCommon_f extends akiPackage {
    json: JsonUtil;
    logger: Logger;
}

interface akiConfig {
    redeemTime: number;
    cleanResponse: boolean;
}

interface akiHelpFunc_f extends akiPackage {
    helpFunctions: object;
}

interface akiCore_f {
    packager: Packager
}

interface Quest {
    rewards: any;
    _id: string;
    conditions: QuestConditionsList;
    traderId: string;
}
interface QuestConditionsList {
    Fail: any;
    AvailableForFinish: QuestAvailableForFinishConditions[];
    AvailableForStart: QuestAvailableForStartConditions[];
}

interface QuestSuccessCriteria {
    _props: {
        compareMethod: ">=" | string;
value: number;
target: string;
status: number[];
    };
_parent: string;
}
interface QuestAvailableForFinishConditions extends QuestSuccessCriteria {

}

interface QuestAvailableForStartConditions extends QuestSuccessCriteria {


}

declare var hash: string;


declare var QuestList: Quest[];

interface UserPMCProfile {
    Hideout: any;
    Skills: any;
    BackendCounters: string;
    aid: string;
    savage: string;
    Customization: any;
    Health: any;
    TraderStandings: any;
    _id: string;
    Info: {
        Nickname: string;
        LowerNickname: string;
        Side: string;
        Voice: string;
        Level: number;
        Experience: number;
        RegistrationDate: number;
        GameVersion: string;
        AccountType: number;
        MemberCategory: number;
        lockedMoveCommands: boolean;
        SavageLockTime: number;
        LastTimePlayedAsSavage: number;
        Settings: {
            Role: string;
            BotDifficulty: string;
            Experience: number;
        },
        NeedWipe: boolean;
        GlobalWipe: boolean;
        NicknameChangeDate: number;
        Bans: [];


    };
    Inventory: {
        items: itemTemplate[];
        stash: string;
        equipment: string;
        questRaidItems: string;
        questStashItems: string;
        fastPanel: any;
    };
    Quests: PlayerQuest[];
}
interface PlayerQuest {
    status: "Started" | "Fail" | "AvailableForFinish";
    startTime: number;
    qid: string;

}

interface itemTemplate {
    _id: string;
    parentId?: string;
    _tpl: string;
    slotId?: string;
    upd?: {
        StackObjectsCount: number;
    },
    location?: {
        x: number;
        y: number;
        r: number;
        isSearched: boolean;
    }
}

interface HashDictionary {
    [index: string]: object;
}
interface ItemDictionary {
    [index: string]: itemTemplate;
}

enum Currency {
    EUR = "569668774bdc2da2298b4568",
    USD = "5696686a4bdc2da3298b456a",
    RUB = "5449016a4bdc2d6f028b456f",
}


interface TemplateLookup {
    items: {
        byId: {},
        byParent: {}
    },
    categories: {
        byId: {};
        byParent: {};
    }
}

interface apiEventResponse {
    items:
    {
        new: itemTemplate[];
        change: itemTemplate[];
        del: itemTemplate[];
    };
    badRequest: any[];
    quests: Quest[];
    ragFairOffers: never[];
    builds: never[];
    currentSalesSums: {};
}