/* json.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const fs = require("fs");

function stringify(data)
{
    return JSON.stringify(data, null, "\t");
}

function parse(string)
{
    return JSON.parse(string);
}

function read(file)
{
    return fs.readFileSync(file, "utf8");
}

function write(file, data)
{
    utility.createDir(file);
    fs.writeFileSync(file, stringify(data), "utf8");
}

module.exports.stringify = stringify;
module.exports.parse = parse;
module.exports.read = read;
module.exports.write = write;