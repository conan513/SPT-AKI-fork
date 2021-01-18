/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { HttpResponse } = require("./src/HttpResponse.js");
const { HttpRouter } = require("./src/HttpRouter.js");
const { HttpServer } = require("./src/HttpServer.js");
const { ImageRouter } = require("./src/ImageRouter.js");
const { HttpCallbacks } = require("./src/HttpCallbacks.js");
const { HttpConfig } = require("./src/HttpConfig.js");

module.exports.response = new HttpResponse();
module.exports.router = new HttpRouter();
module.exports.server = new HttpServer();
module.exports.image = new ImageRouter();
module.exports.callbacks = new HttpCallbacks();
module.exports.config = new HttpConfig();
