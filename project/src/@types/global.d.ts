// declare var core_f: akiCore_f;
// declare var common_f: akiCommon_f;
// declare var certs_f: akiPackage;
// declare var https_f: akiPackage;
// //declare var database_f: akiPackage;
// declare var keepalive_f: akiPackage;
// declare var item_f: akiPackage;
// declare var eft_database_f: akiPackage;
// declare var eft_startup_f: akiPackage;
// declare var save_f: akiPackage;
// declare var health_f: akiPackage;
// declare var inraid_f: akiPackage;
// declare var dialogue_f: akiPackage;
// declare var account_f: akiPackage;
// declare var profile_f: akiPackage;
// declare var notifier_f: akiPackage;
// declare var bots_f: akiPackage;
// declare var helpfunc_f: akiPackage;
// declare var quest_f: akiPackage;
// declare var note_f: akiPackage;
// declare var inventory_f: akiPackage;
// declare var wishList_f: akiPackage;
// declare var trade_f: akiPackage;
// declare var customization_f: akiPackage;
// declare var hideout_f: akiPackage;
// declare var weaponbuilds_f: akiPackage;
// declare var repair_f: akiPackage;
// declare var insurance_f: akiPackage;
// declare var trader_f: akiPackage;
// declare var preset_f: akiPackage;
// declare var ragfair_f: akiPackage;
// declare var weather_f: akiPackage;
// declare var location_f: akiPackage;
// declare var match_f: akiPackage;
// declare var additions_f: akiPackage;
// declare var mods_f: akiPackage;

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


declare var hash: string;



interface HashDictionary {
    [index: string]: object;
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
