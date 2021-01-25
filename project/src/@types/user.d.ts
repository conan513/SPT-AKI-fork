interface UserProfileDictionary {
    [index: string]: any;
}

interface UserPMCProfile {
    Bonuses: any;
    InsuredItems: any;
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
