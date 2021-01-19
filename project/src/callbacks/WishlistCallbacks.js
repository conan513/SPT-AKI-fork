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
    constructor()
    {
        item_f.eventHandler.addEvent("AddToWishList", "Aki", this.addToWishlist.bind(this));
        item_f.eventHandler.addEvent("RemoveFromWishList", "Aki", this.removeFromWishlist.bind(this));
    }

    addToWishlist(pmcData, body, sessionID)
    {
        return wishList_f.controller.addToWishList(pmcData, body, sessionID);
    }

    removeFromWishlist(pmcData, body, sessionID)
    {
        return wishList_f.controller.removeFromWishList(pmcData, body, sessionID);
    }
}

module.exports = new WishlistCallbacks();
