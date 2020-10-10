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
        server_f.server.startCallback["loadLocations"] = this.load.bind(this);
        router_f.router.staticRoutes["/client/locations"] = this.getLocationData.bind(this);
        router_f.router.dynamicRoutes["/api/location"] = this.getLocation.bind(this);
    }

    load()
    {
        location_f.controller.initialize();
    }

    getLocationData(url, info, sessionID)
    {
        return response_f.controller.getBody(location_f.controller.generateAll());
    }

    getLocation(url, info, sessionID)
    {
        return location_f.controller.get(url.replace("/api/location/", ""));
    }
}

module.exports.Callbacks = Callbacks;
