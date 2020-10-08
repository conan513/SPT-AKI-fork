/* wishlist.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 */

"use strict";

class Controller
{
    /* Adding item to wishlist
    *  input: playerProfileData, Request body
    *  output: OK (saved profile)
    * */
    addToWishList(pmcData, body, sessionID)
    {
        for (let item in pmcData["Wishlist"])
        {
            // don't add the item
            if (pmcData.WishList[item] === body["templateId"])
            {
                return item_f.router.getOutput();
            }
        }

        // add the item to the wishlist
        pmcData.WishList.push(body["templateId"]);
        return item_f.router.getOutput();
    }

    /* Removing item to wishlist
    *  input: playerProfileData, Request body
    *  output: OK (saved profile)
    * */
    removeFromWishList(pmcData, body, sessionID)
    {
        for (let i = 0; i < pmcData.WishList.length; i++)
        {
            if (pmcData.WishList[i] === body["templateId"])
            {
                pmcData.WishList.splice(i, 1);
            }
        }

        return item_f.router.getOutput();
    }
}

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

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
