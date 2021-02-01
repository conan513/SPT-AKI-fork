/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class LocationCallbacks
{
    static getLocationData(url, info, sessionID)
    {
        return https_f.response.getBody(location_f.controller.generateAll());
    }

    static getLocation(url, info, sessionID)
    {
        return JsonUtil.serialize(location_f.controller.get(url.replace("/api/location/", "")));
    }
}

module.exports = LocationCallbacks;