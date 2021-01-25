/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 * - BALIST0N
 */

"use strict";

class HealthController
{
    resetVitality(sessionID)
    {
        let profile = save_f.server.profiles[sessionID];

        profile.vitality = {
            "health": {
                "Hydration": 0,
                "Energy": 0,
                "Head": 0,
                "Chest": 0,
                "Stomach": 0,
                "LeftArm": 0,
                "RightArm": 0,
                "LeftLeg": 0,
                "RightLeg": 0
            },
            "effects": {
                "Head": {},
                "Chest": {},
                "Stomach": {},
                "LeftArm": {},
                "RightArm": {},
                "LeftLeg": {},
                "RightLeg": {}
            }
        };

        return profile;
    }

    offraidHeal(pmcData, body, sessionID)
    {
        let output = item_f.eventHandler.getOutput();

        // update medkit used (hpresource)
        for (let item of pmcData.Inventory.items)
        {
            if (item._id === body.item)
            {
                if (!("upd" in item))
                {
                    item.upd = {};
                }

                if ("MedKit" in item.upd)
                {
                    item.upd.MedKit.HpResource -= body.count;
                }
                else
                {
                    const maxhp = helpfunc_f.helpFunctions.getItem(item._tpl)[1]._props.MaxHpResource;
                    item.upd.MedKit = {"HpResource": maxhp - body.count};
                }

                if (item.upd.MedKit.HpResource <= 0)
                {
                    inventory_f.controller.removeItem(pmcData, body.item, output, sessionID);
                }
            }
        }

        return output;
    }

    offraidEat(pmcData, body, sessionID)
    {
        let output = item_f.eventHandler.getOutput();
        let resourceLeft;
        let maxResource;

        for (let item of pmcData.Inventory.items)
        {
            if (item._id === body.item)
            {
                let itemProps = helpfunc_f.helpFunctions.getItem(item._tpl)[1]._props;
                maxResource = itemProps.MaxResource;

                if (maxResource > 1)
                {
                    if (item.upd.FoodDrink !== undefined)
                    {
                        item.upd.FoodDrink.HpPercent -= body.count;
                    }
                    else
                    {
                        item.upd.FoodDrink = {"HpPercent" : maxResource - body.count};
                    }

                    resourceLeft = item.upd.FoodDrink.HpPercent;
                }
            }
        }

        if (maxResource === 1 || resourceLeft < 1)
        {
            output = inventory_f.controller.removeItem(pmcData, body.item, output, sessionID);
        }

        return output;
    }

    /* stores in-raid player health */
    saveVitality(pmcData, info, sessionID)
    {
        const BodyPartsList = info.Health;
        let nodeHealth = save_f.server.profiles[sessionID].vitality.health;
        let nodeEffects = save_f.server.profiles[sessionID].vitality.effects;

        nodeHealth.Hydration = info.Hydration;
        nodeHealth.Energy = info.Energy;
        nodeHealth.Temperature = info.Temperature;

        for (const bodyPart in BodyPartsList)
        {
            if (BodyPartsList[bodyPart].Effects)
            {
                nodeEffects[bodyPart] = BodyPartsList[bodyPart].Effects;
            }

            if (info.IsAlive === true)
            {
                nodeHealth[bodyPart] = BodyPartsList[bodyPart].Current;
            }
            else
            {
                nodeHealth[bodyPart] = pmcData.Health.BodyParts[bodyPart].Health.Maximum * health_f.config.healthMultipliers.death;
            }
        }

        this.saveHealth(pmcData, sessionID);
        this.saveEffects(pmcData, sessionID);
        this.resetVitality(sessionID);

        pmcData.Health.UpdateTime = TimeUtil.getTimestamp();
    }

    healthTreatment(pmcData, info, sessionID)
    {
        const body = {
            "Action": "RestoreHealth",
            "tid": "54cb57776803fa99248b456e",
            "scheme_items": info.items
        };

        helpfunc_f.helpFunctions.payMoney(pmcData, body, sessionID);

        let BodyParts = info.difference.BodyParts;
        let healthInfo = { "IsAlive": true, "Health": {} };

        for (const key in BodyParts)
        {
            const bodyPart = info.difference.BodyParts[key];

            healthInfo.Health[key] = {};
            healthInfo.Health[key].Current = Math.round(pmcData.Health.BodyParts[key].Health.Current + bodyPart.Health);

            if ("Effects" in bodyPart && bodyPart.Effects)
            {
                healthInfo.Health[key].Effects = bodyPart.Effects;
            }
        }

        healthInfo.Hydration = pmcData.Health.Hydration.Current + info.difference.Hydration;
        healthInfo.Energy = pmcData.Health.Energy.Current + info.difference.Energy;
        healthInfo.Temperature = pmcData.Health.Temperature.Current;

        this.saveVitality(pmcData, healthInfo, sessionID);
        return item_f.eventHandler.getOutput();
    }

    addEffect(pmcData, sessionID, info)
    {
        let bodyPart = pmcData.Health.BodyParts[info.bodyPart];

        if (!bodyPart.Effects)
        {
            bodyPart.Effects = {};
        }

        switch (info.effectType)
        {
            case "Fracture":
                bodyPart.Effects.Fracture = { "Time": -1 };
                break;
        }

        // delete empty property to prevent client bugs
        if (this.isEmpty(bodyPart.Effects))
        {
            delete bodyPart.Effects;
        }
    }

    saveHealth(pmcData, sessionID)
    {
        if (!health_f.config.save.health)
        {
            return;
        }

        let nodeHealth = save_f.server.profiles[sessionID].vitality.health;

        for (const item in nodeHealth)
        {
            let target = nodeHealth[item];

            if (item === "Hydration" || item === "Energy" || item === "Temperature")
            {
                // set resources
                if (target > pmcData.Health[item].Maximum)
                {
                    target = pmcData.Health[item].Maximum;
                }

                pmcData.Health[item].Current = Math.round(target);
            }
            else
            {
                if (target === 0)
                {
                    // blacked body part
                    target = Math.round(pmcData.Health.BodyParts[item].Health.Maximum * health_f.config.healthMultipliers.blacked);
                }

                pmcData.Health.BodyParts[item].Health.Current = target;
            }
        }
    }

    saveEffects(pmcData, sessionID)
    {
        if (!health_f.config.save.effects)
        {
            return;
        }

        const nodeEffects = save_f.server.profiles[sessionID].vitality.effects;

        for (const bodyPart in nodeEffects)
        {
            // clear effects
            delete pmcData.Health.BodyParts[bodyPart].Effects;

            // add new
            for (const effect in nodeEffects[bodyPart])
            {
                switch (effect)
                {
                    case "Fracture":
                        this.addEffect(pmcData, sessionID, {bodyPart: bodyPart, effectType: "Fracture"});
                        break;
                }
            }
        }
    }

    isEmpty(map)
    {
        for (let key in map)
        {
            if (key in map)
            {
                return false;
            }
        }

        return true;
    }
}

module.exports = new HealthController();
