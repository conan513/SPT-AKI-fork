/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 */

"use strict";

class WishlistController
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
                return item_f.eventHandler.getOutput();
            }
        }

        // add the item to the wishlist
        pmcData.WishList.push(body["templateId"]);
        return item_f.eventHandler.getOutput();
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

        return item_f.eventHandler.getOutput();
    }
}

module.exports = WishlistController;
