"use strict";

require("../Lib.js");

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
