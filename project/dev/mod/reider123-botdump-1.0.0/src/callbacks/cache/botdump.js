"use strict";

function cache() {

    logger.logInfo("Bot-dump");
    for (let data in db.tool.dump.bots) {
        let prop = json.parse(json.read(db.tool.dump.bots[data]));
        for (var i = prop.data.length - 1; i >= 0; --i) {
            let bot = prop.data[i];
            let botType = bot.Info.Settings.Role;
            logger.logInfo(botType);
            let original = json.parse(json.read(db.tool.dump.result[botType.toLowerCase()]));
            let originNameNumber = Object.keys(original.names).length;
            let originInventoryNumber = Object.keys(original.inventory).length;
            if (botType === "assault") {
                originNameNumber = originNameNumber + 1000;
            } else if (botType === "marksman") {
                originNameNumber = originNameNumber + 1500;
            }
            let exists = false;
            for (let names in original.names) {
                if (bot.Info.Nickname === names) {
                    exists = true;
                }
            }
            if (!exists) {
                logger.logSuccess(bot.Info.Nickname);
                original.names["name_" + originNameNumber] = bot.Info.Nickname;
                ++originNameNumber;
            }
            exists = false;
            for (let head in original.appearance.head) {
                if (bot.Customization.Head === head) {
                    exists = true;
                }
            }
            if (!exists) {
                logger.logSuccess(bot.Customization.Head);
                original.appearance.head[bot.Customization.Head] = bot.Customization.Head;
            }
            exists = false;
            for (let body in original.appearance.body) {
                if (bot.Customization.Body === body) {
                    exists = true;
                }
            }
            if (!exists) {
                logger.logSuccess(bot.Customization.Body);
                original.appearance.body[bot.Customization.Body] = bot.Customization.Body;
            }
            exists = false;
            for (let feet in original.appearance.feet) {
                if (bot.Customization.Feet === feet) {
                    exists = true;
                }
            }
            if (!exists) {
                logger.logSuccess(bot.Customization.Feet);
                original.appearance.feet[bot.Customization.Feet] = bot.Customization.Feet;
            }
            exists = false;
            for (let hands in original.appearance.hands) {
                if (bot.Customization.Hands === hands) {
                    exists = true;
                }
            }
            if (!exists) {
                logger.logSuccess(bot.Customization.Hands);
                original.appearance.hands[bot.Customization.Hands] = bot.Customization.Hands;
            }
            exists = false;
            for (let inventory in original.inventory) {
                if (bot.Inventory === inventory) { //note by reider123: there will be better inventory-duplicate-detecting method. idk if it works as intended in this code.
                    exists = true;
                }
            }
            if (!exists) {
                logger.logSuccess("inventory added");
                original.inventory["inventory_" + originInventoryNumber] = bot.Inventory;
                ++originInventoryNumber;
            }
            json.write(db.tool.dump.result[botType.toLowerCase()], original);
        }
    }
}

server.addCacheCallback("botdump", cache);