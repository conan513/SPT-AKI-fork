"use strict";

require("../Lib.js");

const fixJson = require("json-fixer");

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

    static deserialize(s)
    {
        const { data, changed } = fixJson(`${s}`);

        if (changed)
        {
            Logger.error("Detected faulty json, please fix your json file using VSCodium");
        }

        return data;
    }

    static getData(url)
    {
        let s = "{}";
        try
        {
            s = VFS.readFile(url);
            return JSON.parse(s);
        }
        catch (e)
        {
            let Pos = e.message.split(" ").pop();
            Logger.error(`JSON File Error: ${url} => Pos: ${Pos}`);
        }
        let { data, changed } = fixJson(`${s}`);
        return data;
    }

    static clone(data)
    {
        return JSON.parse(JSON.stringify(data));
    }
}

module.exports = JsonUtil;
