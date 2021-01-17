/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { HttpResponse } = require("./src/response.js");
const { HttpRouter } = require("./src/router.js");
const { HttpServer } = require("./src/server.js");
const { ImageRouter } = require("./src/image.js");
const { HttpCallbacks } = require("./src/callbacks.js");
const { HttpConfig } = require("./src/config.js");

module.exports.response = new HttpResponse();
module.exports.router = new HttpRouter();
module.exports.server = new HttpServer();
module.exports.image = new ImageRouter();
module.exports.callbacks = new HttpCallbacks();
module.exports.config = new HttpConfig();
