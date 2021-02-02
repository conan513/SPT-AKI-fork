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
    static onStaticRoute = {};
    static onDynamicRoute = {};

    static getResponse(req, info, sessionID)
    {
        let output = "";
        let url = req.url;

        // remove retry from url
        if (url.includes("?retry="))
        {
            url = url.split("?retry=")[0];
        }

        if (HttpRouter.onStaticRoute[url])
        {
            // static route found
            for (const callback in HttpRouter.onStaticRoute[url])
            {
                output = HttpRouter.onStaticRoute[url][callback](url, info, sessionID, output);
            }
        }
        else
        {
            for (const route in HttpRouter.onDynamicRoute)
            {
                if (!url.includes(route))
                {
                    // not the route we look for
                    continue;
                }

                // dynamic route found
                for (const callback in HttpRouter.onDynamicRoute[route])
                {
                    output = HttpRouter.onDynamicRoute[route][callback](url, info, sessionID, output);
                }
            }
        }

        return output;
    }
}

module.exports = HttpRouter;
