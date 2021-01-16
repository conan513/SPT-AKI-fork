/* packager.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - SuperBudVar
 */

"use strict";

const fs = require("fs");

global["core_f"] = require("./packager.js");

const source = core_f.packager.loadPackageList();

for (const pkg in source)
{
    console.log(`globalThis.${pkg} = require("./${core_f.packager.basepath}${source[pkg]}");`);
}