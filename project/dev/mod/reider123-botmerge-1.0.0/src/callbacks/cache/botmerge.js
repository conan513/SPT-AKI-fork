"use strict";

function cache() {

    logger.logInfo("Bot-merge");

    for (let type in db.tool.merge.bots) {
        if (type === "base" || type === "core") {
            continue;
        } else {
            let base = {};
            logger.logInfo(type);
            for (let first in db.tool.merge.bots[type]) {
                logger.logSuccess(first);
                base[first] = {};
                if (first === "appearance") {
                    for (let second in db.tool.merge.bots[type][first]) {
                        base[first][second] = {};
                        let inputFiles = db.tool.merge.bots[type][first][second];
                        for (let file in inputFiles) {
                            let filePath = inputFiles[file];
                            let fileData = json.parse(json.read(filePath));
                            base[first][second][file] = fileData;
                        }
                    }
                } else {
                    let inputFiles = db.tool.merge.bots[type][first];
                    for (let file in inputFiles) {
                        let filePath = inputFiles[file];
                        let fileData = json.parse(json.read(filePath));
                        base[first][file] = fileData;
                    }
                }
            }
            json.write(db.tool.merge.bots.result["bot_" + type], base);
        }
    }
}

server.addCacheCallback("botmerge", cache);