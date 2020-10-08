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
    stringify(data)
    {
        return JSON.stringify(data, null, "\t");
    }
    
    parse(string)
    {
        return JSON.parse(string);
    }
    
    read(file)
    {
        return fs.readFileSync(file, "utf8");
    }
    
    write(file, data)
    {
        utility.createDir(file);
        fs.writeFileSync(file, this.stringify(data), "utf8");
    }
}

module.exports.instance = new JsonUtil();
