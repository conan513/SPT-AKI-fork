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

    getResponse(req, info, sessionID)
    {
        let output = "";
        let url = req.url;

        // remove retry from url
        if (url.includes("?retry="))
        {
            url = url.split("?retry=")[0];
        }

        if (this.onStaticRoute[url])
        {
            // static route found
            for (const callback in this.onStaticRoute[url])
            {
                output = this.onStaticRoute[url][callback](url, info, sessionID, output);
            }
        }
        else
        {
            for (const route in this.onDynamicRoute)
            {
                if (!url.includes(route))
                {
                    // not the route we look for
                    continue;
                }

                // dynamic route found
                for (const callback in this.onDynamicRoute[route])
                {
                    output = this.onDynamicRoute[route][callback](url, info, sessionID, output);
                }
            }
        }

        return output;
    }
}

module.exports = new HttpRouter();
