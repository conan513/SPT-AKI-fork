/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const HttpResponse = require("../utils/HttpResponse");
const JsonUtil = require("../utils/JsonUtil");
const LocationController = require("../controllers/LocationController.js");

class LocationCallbacks
{
    static getLocationData(url, info, sessionID)
    {
        return HttpResponse.getBody(LocationController.generateAll());
    }

    static getLocation(url, info, sessionID)
    {
        const location = url.split("=")[1].replace("&variantId", "");
        return HttpResponse.getBody(LocationController.get(location));
    }
}

module.exports = LocationCallbacks;
