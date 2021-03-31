/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

const WishlistController = require("../controllers/WishlistController");

class WishlistCallbacks
{
    static addToWishlist(pmcData, body, sessionID)
    {
        return WishlistController.addToWishList(pmcData, body, sessionID);
    }

    static removeFromWishlist(pmcData, body, sessionID)
    {
        return WishlistController.removeFromWishList(pmcData, body, sessionID);
    }
}

module.exports = WishlistCallbacks;
