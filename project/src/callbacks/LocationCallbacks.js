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

class LocationCallbacks
{
    static getLocationData(url, info, sessionID)
    {
        return HttpResponse.getBody(location_f.controller.generateAll());
    }

    static getLocation(url, info, sessionID)
    {
        return JsonUtil.serialize(location_f.controller.get(url.replace("/api/location/", "")));
    }
}

module.exports = LocationCallbacks;
