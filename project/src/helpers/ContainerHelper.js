const Logger = require("../utils/Logger");
const InventoryHelper = require("./InventoryHelper");

/**
 * ContainerHelper.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Terkoiz
 */
class ContainerHelper
{

    /* Finds a slot for an item in a given 2D container map
     * Output: { success: boolean, x: number, y: number, rotation: boolean }
     */
    findSlotForItem(container2D, itemWidth, itemHeight)
    {
        let rotation = false;
        let minVolume = (itemWidth < itemHeight ? itemWidth : itemHeight) - 1;
        let containerY = container2D.length;
        let containerX = container2D[0].length;
        let limitY = containerY - minVolume;
        let limitX = containerX - minVolume;

        let locateSlot = (x, y, itemW, itemH) =>
        {
            let foundSlot = true;
            for (let itemY = 0; itemY < itemH; itemY++)
            {
                if (foundSlot && y + itemH - 1 > containerY - 1)
                {
                    foundSlot = false;
                    break;
                }

                for (let itemX = 0; itemX < itemW; itemX++)
                {
                    if (foundSlot && x + itemW - 1 > containerX - 1)
                    {
                        foundSlot = false;
                        break;
                    }

                    if (container2D[y + itemY][x + itemX] !== 0)
                    {
                        foundSlot = false;
                        break;
                    }
                }

                if (!foundSlot)
                {
                    break;
                }
            }

            return foundSlot;
        };

        for (let y = 0; y < limitY; y++)
        {
            for (let x = 0; x < limitX; x++)
            {
                let foundSlot = locateSlot(x, y, itemWidth, itemHeight);

                /**Try to rotate if there is enough room for the item
                 * Only occupies one grid of items, no rotation required
                 * */
                if (!foundSlot && itemWidth * itemHeight > 1)
                {
                    foundSlot = locateSlot(x, y, itemHeight, itemWidth);

                    if (foundSlot)
                    {
                        rotation = true;
                    }
                }

                if (!foundSlot)
                {
                    continue;
                }

                return { success: true, x, y, rotation };
            }
        }

        return { success: false, x: null, y: null, rotation: false };
    }

    fillContainerMapWithItem(container2D, x, y, itemW, itemH, rotate)
    {
        let itemWidth = rotate ? itemH : itemW;
        let itemHeight = rotate ? itemW : itemH;

        for (let tmpY = y; tmpY < y + itemHeight; tmpY++)
        {
            for (let tmpX = x; tmpX < x + itemWidth; tmpX++)
            {
                if (container2D[tmpY][tmpX] === 0)
                {
                    container2D[tmpY][tmpX] = 1;
                }
                else
                {
                    throw `Slot at (${x}, ${y}) is already filled`;
                }
            }
        }

        return container2D;
    }

    getContainerMap(containerW, containerH, itemList, containerId)
    {
        const container2D = Array(containerH).fill(0).map(() => Array(containerW).fill(0));
        const inventoryItemHash = InventoryHelper.getInventoryItemHash(itemList);

        const containerItemHash = inventoryItemHash.byParentId[containerId];
        if (!containerItemHash)
        {
            // No items in the container
            return container2D;
        }

        for (const item of containerItemHash)
        {
            if (!("location" in item))
            {
                continue;
            }

            const tmpSize = InventoryHelper.getSizeByInventoryItemHash(item._tpl, item._id, inventoryItemHash);
            const iW = tmpSize[0]; // x
            const iH = tmpSize[1]; // y
            const fH = ((item.location.r === 1 || item.location.r === "Vertical" || item.location.rotation === "Vertical") ? iW : iH);
            const fW = ((item.location.r === 1 || item.location.r === "Vertical" || item.location.rotation === "Vertical") ? iH : iW);
            const fillTo = item.location.x + fW;

            for (let y = 0; y < fH; y++)
            {
                try
                {
                    container2D[item.location.y + y].fill(1, item.location.x, fillTo);
                }
                catch (e)
                {
                    Logger.error(`[OOB] for item with id ${item._id}; Error message: ${e}`);
                }
            }
        }

        return container2D;
    }
}

module.exports = new ContainerHelper();
