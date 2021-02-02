/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const CustomizationController = require("../controllers/CustomizationController.js");

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
        const splittedUrl = url.split("/");
        const traderID = splittedUrl[splittedUrl.length - 2];

        return https_f.response.getBody(CustomizationController.getTraderSuits(traderID, sessionID));
    }

    static wearClothing(pmcData, body, sessionID)
    {
        return CustomizationController.wearClothing(pmcData, body, sessionID);
    }

    static buyClothing(pmcData, body, sessionID)
    {
        return CustomizationController.buyClothing(pmcData, body, sessionID);
    }
}

module.exports = CustomizationCallbacks;
