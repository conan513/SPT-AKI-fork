
interface Quest
{
    rewards: {
        Started: unknown[];
        Success: QuestReward[];
    }
    _id: string;
    conditions: QuestConditionsList;
    traderId: string;
}

interface QuestRewardList
{
    [index: string]: QuestReward;
}
interface QuestReward
{
    type: string;
    items: itemTemplate[];
    target: string;
    mods: itemTemplate[];
}
interface QuestConditionsList
{
    Fail: any;
    AvailableForFinish: QuestAvailableForFinishConditions[];
    AvailableForStart: QuestAvailableForStartConditions[];
}

interface QuestSuccessCriteria
{
    _props: {
        id: string;
        compareMethod: ">=" | string;
        value: number;
        target: string;
        status: number[];
    };
    _parent;

}
interface QuestAvailableForFinishConditions extends QuestSuccessCriteria
{
    _parent: "FindItem" | "CounterCreator" | "HandoverItem" | "PlaceBeacon";
}

interface QuestAvailableForStartConditions extends QuestSuccessCriteria
{
    _parent: "Level" | "Quest";
}

interface PlayerQuest
{
    qid: string;
    completedConditions: string[];
    status: "Started" | "Fail" | "AvailableForFinish" | "Success";
    statusTimers: unknown;
    startTime: number;
}

