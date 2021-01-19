/* HttpRouter.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class HttpRouter
{
    constructor()
    {
        this.onStaticRoute = {};
        this.onDynamicRoute = {};
    }

    addStaticRoute(route, name, callback)
    {
        this.onStaticRoute[route] = this.onStaticRoute[route] || {};
        this.onStaticRoute[route][name] = callback;
    }

    addDynamicRoute(route, name, callback)
    {
        this.onDynamicRoute[route] = this.onDynamicRoute[route] || {};
        this.onDynamicRoute[route][name] = callback;
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
        if (this.onStaticRoute[url])
        {
            for (const callback in this.onStaticRoute[url])
            {
                output = this.onStaticRoute[url][callback](url, info, sessionID, output);
            }
        }
        else
        {
            if (this.onDynamicRoute.find((item) => { url.includes(item) }))
            {
                for (const callback in this.onDynamicRoute[url])
                {
                    output = this.onDynamicRoute[url][callback](url, info, sessionID, output);
                }
            }
        }

        return output;
    }
}

module.exports = new HttpRouter();
