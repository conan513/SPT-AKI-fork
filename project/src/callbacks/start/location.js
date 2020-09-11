"use strict";

function load()
{
    location_f.locationServer.initialize();
}

server.addStartCallback("loadLocations", load);