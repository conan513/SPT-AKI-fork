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

        /* remove retry from URL */
        if (url.includes("?retry="))
        {
            url = url.split("?retry=")[0];
        }

        /* route request */
        if (url in this.onStaticRoute)
        {
            output = this.onStaticRoute[url](url, info, sessionID);
        }
        else
        {
            for (let key in this.onDynamicRoute)
            {
                if (url.includes(key))
                {
                    output = this.onDynamicRoute[key](url, info, sessionID);
                }
            }
        }

        return output;
    }
}

module.exports = new HttpRouter();
