/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { VFS } = require("./src/vfs.js");
const { JsonUtil } = require("./src/json.js");
const { TimeUtil } = require("./src/time.js");
const { RandomUtil } = require("./src/random.js");
const { HashUtil } = require("./src/hash.js");
const { Logger } = require("./src/logger.js");

module.exports.vfs = new VFS();
module.exports.json = new JsonUtil();
module.exports.time = new TimeUtil();
module.exports.random = new RandomUtil();
module.exports.hash = new HashUtil();
module.exports.logger = new Logger();
