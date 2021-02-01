interface itemTemplate
{
    _id: string;
    _tpl: string;
    _props?: {
        filters?: unknown[];
    };
    parentId?: string;

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

interface ItemDictionary
{
    [index: string]: itemTemplate;
}
