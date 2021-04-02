"use strict";

require("../Lib.js");

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
