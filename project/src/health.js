/* health.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

/* controller class maintains list of health for each sessionID in memory. */
class Controller
{
    resetHealth(sessionID)
    {
        let profile = save_f.server.profiles[sessionID];

        profile.vitality  = {
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
        let output = item_f.router.getOutput();

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

                if (item.upd.MedKit.HpResource === 0)
                {
                    inventory_f.controller.removeItem(pmcData, body.item, output, sessionID);
                }
            }
        }

        return output;
    }

    offraidEat(pmcData, body, sessionID)
    {
        let output = item_f.router.getOutput();
        let resourceLeft;
        let maxResource = {};

        for (let item of pmcData.Inventory.items)
        {
            if (item._id === body.item)
            {
                let itemProps = helpfunc_f.helpFunctions.getItem(item._tpl)[1]._props;
                maxResource = itemProps.MaxResource;

                if (maxResource > 1)
                {
                    if ("FoodDrink" in item.upd)
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
    saveHealth(pmcData, info, sessionID)
    {
        const BodyPartsList = info.Health;
        let nodeHealth = save_f.server.profiles[sessionID].vitality.health;
        let nodeEffects = save_f.server.profiles[sessionID].vitality.effects;

        nodeHealth.Hydration = info.Hydration;
        nodeHealth.Energy = info.Energy;

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
                nodeHealth[bodyPart] = -1;
            }
        }

        this.applyHealth(pmcData, sessionID);
    }

    /* stores the player health changes */
    updateHealth(info, sessionID)
    {
        let node = save_f.server.profiles[sessionID].vitality.health;

        switch (info.type)
        {
            /* store difference from infill */
            case "HydrationChanged":
            case "EnergyChanged":
                node[(info.type).replace("Changed", "")] += parseInt(info.diff);
                break;

            /* difference is already applies */
            case "HealthChanged":
                node[info.bodyPart] = info.value;
                break;

            /* store state and make server aware to kill all body parts */
            case "Died":
                node = {
                    "Hydration": save_f.server.profiles[sessionID].vitality.health.Hydration,
                    "Energy": save_f.server.profiles[sessionID].vitality.health.Energy,
                    "Head": -1,
                    "Chest": -1,
                    "Stomach": -1,
                    "LeftArm": -1,
                    "RightArm": -1,
                    "LeftLeg": -1,
                    "RightLeg": -1
                };
                break;
        }

        save_f.server.profiles[sessionID].vitality.health = node;
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

        healthInfo.Energy = pmcData.Health.Energy.Current + info.difference.Energy;
        healthInfo.Hydration = pmcData.Health.Hydration.Current + info.difference.Hydration;

        this.saveHealth(pmcData, healthInfo, sessionID);
        return item_f.router.getOutput();
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
            case "BreakPart":
                bodyPart.Effects.BreakPart = { "Time": -1 };
                break;
        }

        // delete empty property to prevent client bugs
        if (this.isEmpty(bodyPart.Effects))
        {
            delete bodyPart.Effects;
        }
    }

    removeEffect(pmcData, sessionID, info)
    {
        let bodyPart = pmcData.Health.BodyParts[info.bodyPart];

        if (!("Effects" in bodyPart))
        {
            return;
        }

        switch (info.effectType)
        {
            case "BreakPart":
                if ("BreakPart" in bodyPart.Effects)
                {
                    delete bodyPart.Effects.BreakPart;
                }
        }

        // delete empty property to prevent client bugs
        if (this.isEmpty(bodyPart.Effects))
        {
            delete bodyPart.Effects;
        }
    }

    /* apply the health changes to the profile */
    applyHealth(pmcData, sessionID)
    {
        if (!save_f.config.saveHealthEnabled)
        {
            return;
        }

        let nodeHealth = save_f.server.profiles[sessionID].vitality.health;

        for (const item in nodeHealth)
        {
            if (item !== "Hydration" && item !== "Energy")
            {
                /* set body part health */
                pmcData.Health.BodyParts[item].Health.Current = (nodeHealth[item] <= 0)
                    ? Math.round(pmcData.Health.BodyParts[item].Health.Maximum)
                    : nodeHealth[item];
            }
            else
            {
                /* set resources */
                if (nodeHealth[item] > pmcData.Health[item].Maximum)
                {
                    nodeHealth[item] = pmcData.Health[item].Maximum;
                }

                pmcData.Health[item].Current = Math.round(nodeHealth[item]);
            }
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
                    case "BreakPart":
                        this.addEffect(pmcData, sessionID, {bodyPart: bodyPart, effectType: "BreakPart"});
                        break;
                }
            }
        }

        pmcData.Health.UpdateTime = Math.round(Date.now() / 1000);
        this.resetHealth(sessionID);
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

class Callbacks
{
    constructor()
    {
        save_f.server.onLoadCallback["health"] = this.onLoad.bind();

        router.addStaticRoute("/player/health/sync", this.syncHealth.bind());
        router.addStaticRoute("/player/health/events", this.updateHealth.bind());
        item_f.router.addRoute("Eat", this.offraidEat.bind());
        item_f.router.addRoute("Heal", this.offraidHeal.bind());
        item_f.router.addRoute("RestoreHealth", this.healthTreatment.bind());
    }

    onLoad(sessionID)
    {
        return health_f.controller.resetHealth(sessionID);
    }

    syncHealth(url, info, sessionID)
    {
        let pmcData = profile_f.controller.getPmcProfile(sessionID);
        health_f.controller.saveHealth(pmcData, info, sessionID);
        return response_f.controller.nullResponse();
    }

    updateHealth(url, info, sessionID)
    {
        health_f.controller.updateHealth(info, sessionID);
        return response_f.controller.nullResponse();
    }

    offraidEat(pmcData, body, sessionID)
    {
        return health_f.controller.offraidEat(pmcData, body, sessionID);
    }

    offraidHeal(pmcData, body, sessionID)
    {
        return health_f.controller.offraidHeal(pmcData, body, sessionID);
    }

    healthTreatment(pmcData, info, sessionID)
    {
        return health_f.controller.healthTreatment(pmcData, info, sessionID);
    }
}

class Config
{
    constructor()
    {
        this.saveHealthEnabled = true;
    }
}

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
module.exports.config = new Config();