"use strict";

/* HealthServer class maintains list of health for each sessionID in memory. */
class HealthServer
{
    resetHealth(sessionID)
    {
        let profile = save_f.saveServer.profiles[sessionID];

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
        let output = item_f.itemServer.getOutput();

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
                    let maxhp = helpfunc_f.helpFunctions.getItem(item._tpl)[1]._props.MaxHpResource;
                    item.upd.MedKit = {"HpResource": maxhp - body.count};
                }

                if (item.upd.MedKit.HpResource === 0)
                {
                    inventory_f.inventoryController.removeItem(pmcData, body.item, output, sessionID);
                }
            }
        }

        return output;
    }

    offraidEat(pmcData, body, sessionID)
    {
        let output = item_f.itemServer.getOutput();
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
            output = inventory_f.inventoryController.removeItem(pmcData, body.item, output, sessionID);
        }

        return output;
    }

    /* stores in-raid player health */
    saveHealth(pmcData, info, sessionID)
    {
        let nodeHealth = save_f.saveServer.profiles[sessionID].vitality.health;
        let nodeEffects = save_f.saveServer.profiles[sessionID].vitality.effects;
        let BodyPartsList = info.Health;

        nodeHealth.Hydration = info.Hydration;
        nodeHealth.Energy = info.Energy;

        for (let bodyPart of Object.keys(BodyPartsList))
        {
            if (BodyPartsList[bodyPart].Effects != undefined)
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
        let node = save_f.saveServer.profiles[sessionID].vitality.health;

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
                    "Hydration": save_f.saveServer.profiles[sessionID].vitality.health.Hydration,
                    "Energy": save_f.saveServer.profiles[sessionID].vitality.health.Energy,
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

        save_f.saveServer.profiles[sessionID].vitality.health = node;
    }

    healthTreatment(pmcData, info, sessionID)
    {
        let body = {
            "Action": "RestoreHealth",
            "tid": "54cb57776803fa99248b456e",
            "scheme_items": info.items
        };

        helpfunc_f.helpFunctions.payMoney(pmcData, body, sessionID);

        let BodyParts = info.difference.BodyParts;
        let BodyPartKeys = Object.keys(BodyParts);
        let healthInfo = { "IsAlive": true, "Health": {} };

        for (let key of BodyPartKeys)
        {
            let bodyPart = info.difference.BodyParts[key];
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
        return item_f.itemServer.getOutput();
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
        if (!gameplayConfig.inraid.saveHealthEnabled)
        {
            return;
        }

        let nodeHealth = save_f.saveServer.profiles[sessionID].vitality.health;
        let keys = Object.keys(nodeHealth);

        for (let item of keys)
        {
            if (item !== "Hydration" && item !== "Energy")
            {
                /* set body part health */
                pmcData.Health.BodyParts[item].Health.Current = (nodeHealth[item] <= 0)
                    ? Math.round((pmcData.Health.BodyParts[item].Health.Maximum * gameplayConfig.inraid.saveHealthMultiplier))
                    : nodeHealth[item];
            }
            else
            {
                /* set resources */
                pmcData.Health[item].Current = nodeHealth[item];

                if (pmcData.Health[item].Current > pmcData.Health[item].Maximum)
                {
                    pmcData.Health[item].Current = pmcData.Health[item].Maximum;
                }
            }
        }

        let nodeEffects = save_f.saveServer.profiles[sessionID].vitality.effects;
        
        Object.keys(nodeEffects).forEach(bodyPart =>
        {
            // clear effects
            delete pmcData.Health.BodyParts[bodyPart].Effects;

            // add new
            Object.keys(nodeEffects[bodyPart]).forEach(effect =>
            {
                switch (effect)
                {
                    case "BreakPart":
                        this.addEffect(pmcData, sessionID, {bodyPart: bodyPart, effectType: "BreakPart"});
                        break;
                }
            });
        });

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

class HealthCallbacks
{
    constructor()
    {
        save_f.saveServer.onLoadCallback["health"] = this.onLoad.bind();

        router.addStaticRoute("/player/health/sync", this.syncHealth.bind());
        router.addStaticRoute("/player/health/events", this.updateHealth.bind());
        item_f.itemServer.addRoute("Eat", this.offraidEat.bind());
        item_f.itemServer.addRoute("Heal", this.offraidHeal.bind());
        item_f.itemServer.addRoute("RestoreHealth", this.healthTreatment.bind());
    }

    onLoad(sessionID)
    {
        return health_f.healthServer.resetHealth(sessionID);
    }

    syncHealth(url, info, sessionID)
    {
        let pmcData = profile_f.profileController.getPmcProfile(sessionID);
        health_f.healthServer.saveHealth(pmcData, info, sessionID);
        return response_f.responseController.nullResponse();
    }

    updateHealth(url, info, sessionID)
    {
        health_f.healthServer.updateHealth(info, sessionID);
        return response_f.responseController.nullResponse();
    }

    offraidEat(pmcData, body, sessionID)
    {
        return health_f.healthServer.offraidEat(pmcData, body, sessionID);
    }

    offraidHeal(pmcData, body, sessionID)
    {
        return health_f.healthServer.offraidHeal(pmcData, body, sessionID);
    }

    healthTreatment(pmcData, info, sessionID)
    {
        return health_f.healthServer.healthTreatment(pmcData, info, sessionID);
    }
}

module.exports.healthServer = new HealthServer();
module.exports.healthCallbacks = new HealthCallbacks();
