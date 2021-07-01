"use strict";

require("../Lib.js");

class RepairController
{
    static repair(pmcData, body, sessionID)
    {
        let output = ItemEventRouter.getOutput(sessionID);
        const trader = TraderController.getTrader(body.tid, sessionID);
        const repairRate = (trader.repair.price_rate === 0) ? 1 : (trader.repair.price_rate / 100 + 1);

        // find the item to repair
        for (let repairItem of body.repairItems)
        {
            let itemToRepair = pmcData.Inventory.items.find((item) =>
            {
                return item._id === repairItem._id;
            });

            if (itemToRepair === undefined)
            {
                continue;
            }

            // get repair price and pay the money
            const repairCost = Math.round((DatabaseServer.tables.templates.items[itemToRepair._tpl]._props.RepairCost * repairItem.count * repairRate) * RepairConfig.priceMultiplier);
            const options = {
                "scheme_items": [
                    {
                        "id": repairItem._id,
                        "count": Math.round(repairCost)
                    }
                ],
                "tid": body.tid
            };

            if (!PaymentController.payMoney(pmcData, options, sessionID))
            {
                Logger.error("no money found");
                return "";
            }

            // change item durability
            const repairable = itemToRepair.upd.Repairable;
            let durability = repairable.Durability + repairItem.count;

            itemToRepair.upd.Repairable = {
                "Durability": (repairable.MaxDurability > durability) ? durability : repairable.MaxDurability,
                "MaxDurability": (repairable.MaxDurability > durability) ? durability : repairable.MaxDurability
            };

            //repairing mask cracks
            if ("FaceShield" in itemToRepair.upd && itemToRepair.upd.FaceShield.Hits > 0)
            {
                itemToRepair.upd.FaceShield.Hits = 0;
            }

            output.profileChanges[sessionID].items.change.push(itemToRepair);
        }

        return output;
    }
}

module.exports = RepairController;
