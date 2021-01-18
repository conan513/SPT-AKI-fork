/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { VFS } = require("./src/VFS.js");
const { JsonUtil } = require("./src/JsonUtil.js");
const { TimeUtil } = require("./src/TimeUtil.js");
const { RandomUtil } = require("./src/RandomUtil.js");
const { HashUtil } = require("./src/HashUtil.js");
const { Logger } = require("./src/Logger.js");

module.exports.vfs = new VFS();
module.exports.json = new JsonUtil();
module.exports.time = new TimeUtil();
module.exports.random = new RandomUtil();
module.exports.hash = new HashUtil();
module.exports.logger = new Logger();
