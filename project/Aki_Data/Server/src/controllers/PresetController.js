/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Emperor06
 */

"use strict";

class PresetController
{
    initialize()
    {
        const presets = Object.values(database_f.server.tables.globals.ItemPresets);
        const reverse = {};

        for (const p of presets)
        {
            let tpl = p._items[0]._tpl;

            if (!(tpl in reverse))
            {
                reverse[tpl] = [];
            }

            reverse[tpl].push(p._id);
        }

        this.lookup = reverse;
    }

    isPreset(id)
    {
        return id in database_f.server.tables.globals.ItemPresets;
    }

    hasPreset(templateId)
    {
        return templateId in this.lookup;
    }

    getPreset(id)
    {
        return database_f.server.tables.globals.ItemPresets[id];
    }

    getPresets(templateId)
    {
        if (!this.hasPreset(templateId))
        {
            return [];
        }

        const presets = [];
        const ids = this.lookup[templateId];

        for (const id of ids)
        {
            presets.push(database_f.server.tables.globals.ItemPresets[id]);
        }

        return presets;
    }

    getStandardPreset(templateId)
    {
        if (!this.hasPreset(templateId))
        {
            return false;
        }

        const allPresets = this.getPresets(templateId);

        for (const p of allPresets)
        {
            if ("_encyclopedia" in p)
            {
                return p;
            }
        }

        return allPresets[0];
    }

    getBaseItemTpl(presetId)
    {
        if (this.isPreset(presetId))
        {
            let preset = database_f.server.tables.globals.ItemPresets[presetId];

            for (let item of preset._items)
            {
                if (preset._parent === item._id)
                {
                    return item._tpl;
                }
            }
        }

        return "";
    }
}

module.exports = new PresetController();
