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

class Helpers
{
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

    dumpQuests(quests, label = null)
    {
        for (const quest of quests)
        {
            common_f.logger.logDebug(`${this.getQuestLocale(quest._id).name} (${quest._id})`);
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
        }
    }
}
module.exports.Helpers = Helpers;