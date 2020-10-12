/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Callbacks
{
    constructor()
    {
        https_f.server.startCallback["loadLocations"] = this.load.bind(this);
        https_f.router.staticRoutes["/client/locations"] = this.getLocationData.bind(this);
        https_f.router.dynamicRoutes["/api/location"] = this.getLocation.bind(this);
    }

    load()
    {
        location_f.controller.initialize();
    }

    getLocationData(url, info, sessionID)
    {
        return https_f.response.getBody(location_f.controller.generateAll());
    }

    getLocation(url, info, sessionID)
    {
        return location_f.controller.get(url.replace("/api/location/", ""));
    }
}

module.exports.Callbacks = Callbacks;
