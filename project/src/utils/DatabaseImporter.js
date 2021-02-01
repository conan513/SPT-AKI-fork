/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - Ginja
 */

"use strict";

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
        const files = vfs.getFiles(filepath);
        const directories = vfs.getDirs(filepath);

        // add file content to result
        for (const file of files)
        {
            const filename = file.split(".").slice(0, -1).join(".");
            result[filename] = JsonUtil.deserialize(vfs.readFile(`${filepath}${file}`));
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
        const dirs = vfs.getDirs(filepath);
        const routes = [
            "/files/CONTENT/banners/",
            "/files/handbook/",
            "/files/Hideout/",
            "/files/quest/icon/",
            "/files/trader/avatar/",
        ];

        for (const i in dirs)
        {
            const files = vfs.getFiles(`${filepath}${dirs[i]}`);

            for (const file of files)
            {
                const filename = file.split(".").slice(0, -1).join(".");
                https_f.image.onRoute[`${routes[i]}${filename}`] = `${filepath}${dirs[i]}/${file}`;
            }
        }
    }
}

module.exports = DatabaseImporter;
