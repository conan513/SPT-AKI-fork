/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class CustomizationCallbacks
{
    static getSuits(url, info, sessionID)
    {
        return https_f.response.getBody({
            "_id": `pmc${sessionID}`,
            "suites": save_f.server.profiles[sessionID].suits
        });
    }

    static getTraderSuits(url, info, sessionID)
    {
        let splittedUrl = url.split("/");
        let traderID = splittedUrl[splittedUrl.length - 2];

        return https_f.response.getBody(customization_f.controller.getTraderSuits(traderID, sessionID));
    }

    static wearClothing(pmcData, body, sessionID)
    {
        return customization_f.controller.wearClothing(pmcData, body, sessionID);
    }

    static buyClothing(pmcData, body, sessionID)
    {
        return customization_f.controller.buyClothing(pmcData, body, sessionID);
    }
}

module.exports = CustomizationCallbacks;
