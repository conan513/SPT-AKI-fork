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

interface ItemDictionary {
    [index: string]: itemTemplate;
}
