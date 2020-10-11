/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - PoloYolo
 */

"use strict";

class Callbacks
{
    constructor()
    {
        item_f.router.routes["AddToWishList"] = this.addToWishlist.bind(this);
        item_f.router.routes["RemoveFromWishList"] = this.removeFromWishlist.bind(this);
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

module.exports.Callbacks = Callbacks;
