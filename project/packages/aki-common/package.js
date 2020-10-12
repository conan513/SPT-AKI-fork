/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { Utility } = require("./src/utility.js");
const { JsonUtil } = require("./src/json.js");
const { Logger } = require("./src/logger.js");

module.exports.utility = new Utility();
module.exports.json = new JsonUtil();
module.exports.logger = new Logger();
