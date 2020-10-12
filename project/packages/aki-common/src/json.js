/* json.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const fs = require("fs");

class JsonUtil
{
    stringify(data, prettify)
    {
        if (prettify)
        {
            JSON.stringify(data, null, "\t")
        }
        else
        {
            return JSON.stringify(data);
        }
        
    }

    parse(string)
    {
        return JSON.parse(string);
    }
}

module.exports.JsonUtil = JsonUtil;
