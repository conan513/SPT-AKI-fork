/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

class WishlistCallbacks
{
    static addToWishlist(pmcData, body, sessionID)
    {
        return wishList_f.controller.addToWishList(pmcData, body, sessionID);
    }

    static removeFromWishlist(pmcData, body, sessionID)
    {
        return wishList_f.controller.removeFromWishList(pmcData, body, sessionID);
    }
}

module.exports = WishlistCallbacks;
