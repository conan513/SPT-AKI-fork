/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { VFS } = require("./src/vfs.js");
const { JsonUtil } = require("./src/json.js");
const { Utility } = require("./src/utility.js");
const { Logger } = require("./src/logger.js");

module.exports.vfs = new VFS();
module.exports.json = new JsonUtil();
module.exports.utility = new Utility();
module.exports.logger = new Logger();
