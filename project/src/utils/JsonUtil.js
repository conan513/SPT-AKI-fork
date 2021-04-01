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
    static serialize(data, prettify = false)
    {
        if (prettify)
        {
            return JSON.stringify(data, null, "\t");
        }
        else
        {
            return JSON.stringify(data);
        }
    }

    static deserialize(string)
    {
        return JSON.parse(string);
    }

    static clone(data)
    {
        return JSON.parse(JSON.stringify(data));
    }
}

module.exports = JsonUtil;
