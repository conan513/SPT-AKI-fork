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
    constructor()
    {
        https_f.router.onStaticRoute["/client/locations"] = this.getLocationData.bind(this);
        https_f.router.onDynamicRoute["/api/location"] = this.getLocation.bind(this);
    }

    getLocationData(url, info, sessionID)
    {
        return https_f.response.getBody(location_f.controller.generateAll());
    }

    getLocation(url, info, sessionID)
    {
        return common_f.json.serialize(location_f.controller.get(url.replace("/api/location/", "")));
    }
}

module.exports = LocationCallbacks;
