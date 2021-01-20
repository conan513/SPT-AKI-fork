
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

interface PlayerQuest {
    status: "Started" | "Fail" | "AvailableForFinish";
    startTime: number;
    qid: string;

}

declare var QuestList: Quest[];
