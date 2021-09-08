"use strict";

require("../Lib.js");

const crypto = require("crypto");

class HashUtil
{
    static generate()
    {
        const shasum = crypto.createHash("sha1");
        const time = Math.random() * TimeUtil.getTimestamp();

        shasum.update(time.toString());
        return shasum.digest("hex").substring(0, 24);
    }

    static generateMd5ForData(data)
    {
        const shasum = crypto.createHash("md5");
        shasum.update(data);
        return shasum.digest("hex");
    }
}

module.exports = HashUtil;
