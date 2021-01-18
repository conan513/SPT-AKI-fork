/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 * - Emperor06
 * - Ginja
 * - Ereshkigal
 */

"use strict";

class QuestHelpers
{
    constructor()
    {
        /* changing these will require a wipe */
        this.status = {
            Locked: 0,
            AvailableForStart: 1,
            Started: 2,
            AvailableForFinish: 3,
            Success: 4,
            Fail: 5,
            FailRestartable: 6,
            MarkedAsFailed: 7
        };
    }
    filterConditions(q, questType, furtherFilter = null)
    {

        const filteredQuests = q.filter(
            c =>
            {
                if (c._parent === questType)
                {
                    if (furtherFilter)
                    {
                        return furtherFilter(c);
                    }
                    return true;
                }
                return false;
            });
        return filteredQuests;
    }

    getQuestConditions(q, furtherFilter = null)
    {
        return this.filterConditions(q, "Quest", furtherFilter);
    }

    getLevelConditions(q, furtherFilter = null)
    {
        return this.filterConditions(q, "Level", furtherFilter);
    }

    // returns true is the condition is satisfied
    evaluateLevel(pmcProfile, cond)
    {
        let level = pmcProfile.Info.Level;
        if (cond._parent === "Level")
        {
            switch (cond._props.compareMethod)
            {
                case ">=":
                    return level >= cond._props.value;
                default:
                    common_f.logger.logDebug(`Unrecognised Comparison Method: ${cond._props.compareMethod}`);
                    return false;
            }
        }
    }

    /* debug functions */

    getQuestLocale(questId)
    {
        const questLocale = database_f.server.tables.locales.global["en"].quest[questId];
        return questLocale;
    }

    getDeltaQuests(before, after)
    {
        let knownQuestsIds = [];
        before.forEach((q) =>
        {
            knownQuestsIds.push(q._id);
        });
        if (knownQuestsIds.length)
        {
            return after.filter((q) =>
            {
                return knownQuestsIds.indexOf(q._id) === -1;
            });
        }
        return after;
    }

    dumpQuests(quests, label = null)
    {
        for (const quest of quests)
        {
            const currentQuestLocale = this.getQuestLocale(quest._id);
            common_f.logger.logDebug(`${currentQuestLocale.name} (${quest._id})`);
            for (const cond of quest.conditions.AvailableForStart)
            {
                let output = `- ${cond._parent} `;

                if (cond._parent === "Quest")
                {
                    if (cond._props.target !== void 0)
                    {
                        const locale = this.getQuestLocale(cond._props.target);
                        if (locale)
                        {
                            output += `linked to: ${locale.name} `;
                        }
                        output += `(${cond._props.target}) with status: `;
                    }

                }
                else
                {
                    output += `${cond._props.compareMethod} ${cond._props.value}`;
                }
                common_f.logger.logDebug(output);
            }
            common_f.logger.logDebug("AvailableForFinish info:");
            for (const cond of quest.conditions.AvailableForFinish)
            {
                let output = `- ${cond._parent} `;
                switch (cond._parent)
                {
                    case "FindItem":
                    case "CounterCreator":
                        if (cond._props.target !== void 0)
                        {
                            const taskDescription = currentQuestLocale.conditions[cond._props.id];
                            if (taskDescription)
                            {
                                output += `: ${taskDescription} `;
                            }
                            else
                            {
                                output += `Description not found: ${cond._props.id}`;
                            }
                            output += `(${cond._props.target}) with status: `;
                        }
                        break;

                    case "HandoverItem":
                    case "PlaceBeacon":
                        break;
                    default:
                        output += `${cond._props.compareMethod} ${cond._props.value}`;
                        console.log(cond);
                        break;
                }

                common_f.logger.logDebug(output);
            }
            common_f.logger.logDebug("-- end\n");
        }
    }
}
module.exports = new QuestHelpers();