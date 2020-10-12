/* json.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class JsonUtil
{
    serialize(data, prettify = false)
    {
        if (prettify)
        {
            JSON.stringify(data, null, "\t");
        }
        else
        {
            return JSON.stringify(data);
        }
    }

    deserialize(string)
    {
        return JSON.parse(string);
    }
}

module.exports.JsonUtil = JsonUtil;
