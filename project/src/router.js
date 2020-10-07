/* account.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Router
{
    constructor()
    {
        this.staticRoutes = {};
        this.dynamicRoutes = {};
    }

    /* sets static routes to check for */
    addStaticRoute(route, callback)
    {
        this.staticRoutes[route] = callback;
    }

    /* sets dynamic routes to check for */
    addDynamicRoute(route, callback)
    {
        this.dynamicRoutes[route] = callback;
    }

    getResponse(req, info, sessionID)
    {
        let output = "";
        let url = req.url;

        /* remove retry from URL */
        if (url.includes("?retry="))
        {
            url = url.split("?retry=")[0];
        }

        /* route request */
        if (url in this.staticRoutes)
        {
            output = this.staticRoutes[url](url, info, sessionID);
        }
        else
        {
            for (let key in this.dynamicRoutes)
            {
                if (url.includes(key))
                {
                    output = this.dynamicRoutes[key](url, info, sessionID);
                }
            }
        }

        return output;
    }
}

module.exports.router = new Router();
