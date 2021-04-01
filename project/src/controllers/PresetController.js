/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Emperor06
 */

"use strict";

const DatabaseServer = require("../servers/DatabaseServer");

class PresetController
{
    static lookup = {};

    static initialize()
    {
        const presets = Object.values(DatabaseServer.tables.globals.ItemPresets);
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

        PresetController.lookup = reverse;
    }

    static isPreset(id)
    {
        return id in DatabaseServer.tables.globals.ItemPresets;
    }

    static hasPreset(templateId)
    {
        return templateId in PresetController.lookup;
    }

    static getPreset(id)
    {
        return DatabaseServer.tables.globals.ItemPresets[id];
    }

    static getPresets(templateId)
    {
        if (!PresetController.hasPreset(templateId))
        {
            return [];
        }

        const presets = [];
        const ids = PresetController.lookup[templateId];

        for (const id of ids)
        {
            presets.push(DatabaseServer.tables.globals.ItemPresets[id]);
        }

        return presets;
    }

    static getStandardPreset(templateId)
    {
        if (!PresetController.hasPreset(templateId))
        {
            return false;
        }

        const allPresets = PresetController.getPresets(templateId);

        for (const p of allPresets)
        {
            if ("_encyclopedia" in p)
            {
                return p;
            }
        }

        return allPresets[0];
    }

    static getBaseItemTpl(presetId)
    {
        if (PresetController.isPreset(presetId))
        {
            let preset = DatabaseServer.tables.globals.ItemPresets[presetId];

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

module.exports = PresetController;
