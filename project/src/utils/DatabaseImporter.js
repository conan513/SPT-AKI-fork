/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 */

"use strict";

const VFS = require("./VFS");
const ImageRouter = require("../routers/ImageRouter");
const JsonUtil = require("./JsonUtil");

class DatabaseImporter
{
    static load()
    {
        const filepath = (globalThis.G_RELEASE_CONFIGURATION) ? "Aki_Data/Server/" : "./assets/";
        database_f.server.tables = DatabaseImporter.loadRecursive(`${filepath}database/`);
        DatabaseImporter.loadImages(`${filepath}images/`);
    }

    static loadRecursive(filepath)
    {
        let result = {};

        // get all filepaths
        const files = VFS.getFiles(filepath);
        const directories = VFS.getDirs(filepath);

        // add file content to result
        for (const file of files)
        {
            if (VFS.getFileExtension(file) === "json") {
                const filename = VFS.stripExtension(file);
                result[filename] = JsonUtil.deserialize(VFS.readFile(`${filepath}${file}`));
            }
        }

        // deep tree search
        for (const dir of directories)
        {
            result[dir] = DatabaseImporter.loadRecursive(`${filepath}${dir}/`);
        }

        return result;
    }

    static loadImages(filepath)
    {
        const dirs = VFS.getDirs(filepath);
        const routes = [
            "/files/CONTENT/banners/",
            "/files/handbook/",
            "/files/Hideout/",
            "/files/quest/icon/",
            "/files/trader/avatar/",
        ];

        for (const i in dirs)
        {
            const files = VFS.getFiles(`${filepath}${dirs[i]}`);

            for (const file of files)
            {
                const filename = VFS.stripExtension(file);
                ImageRouter.onRoute[`${routes[i]}${filename}`] = `${filepath}${dirs[i]}/${file}`;
            }
        }
    }
}

module.exports = DatabaseImporter;
