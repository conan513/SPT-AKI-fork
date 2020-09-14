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
                return item_f.itemServer.getOutput();
            }
        }

        // add the item to the wishlist
        pmcData.WishList.push(body["templateId"]);
        return item_f.itemServer.getOutput();
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

        return item_f.itemServer.getOutput();
    }
}

class WishlistCallbacks
{
    constructor()
    {
        item_f.itemServer.addRoute("AddToWishList", this.addToWishlist.bind());
        item_f.itemServer.addRoute("RemoveFromWishList", this.removeFromWishlist.bind());
    }

    addToWishlist(pmcData, body, sessionID)
    {
        return wishList_f.addToWishList(pmcData, body, sessionID);
    }

    removeFromWishlist(pmcData, body, sessionID)
    {
        return wishList_f.removeFromWishList(pmcData, body, sessionID);
    }
}

module.exports.wishlistController = new WishlistController();
module.exports.wishlistCallbacks = new WishlistCallbacks();