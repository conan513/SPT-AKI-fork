/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { InsuranceController } = require("./src/InsuranceController.js");
const { InsuranceCallbacks } = require("./src/InsuranceCallbacks.js");
const { InsuranceConfig } = require("./src/InsuranceConfig.js");

module.exports.controller = new InsuranceController();
module.exports.callbacks = new InsuranceCallbacks();
module.exports.config = new InsuranceConfig();
