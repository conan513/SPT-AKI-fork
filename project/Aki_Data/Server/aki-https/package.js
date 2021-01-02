/* package.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const { Response } = require("./src/response.js");
const { Router } = require("./src/router.js");
const { Server } = require("./src/server.js");
const { ImageHandler } = require("./src/image.js");
const { Callbacks } = require("./src/callbacks.js");
const { Config } = require("./src/config.js");

module.exports.response = new Response();
module.exports.router = new Router();
module.exports.server = new Server();
module.exports.image = new ImageHandler();
module.exports.callbacks = new Callbacks();
module.exports.config = new Config();
