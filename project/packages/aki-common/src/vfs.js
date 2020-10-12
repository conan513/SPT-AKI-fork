/* common_f.vfs.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const fs = require("fs");
const path = require("path");

class VFS
{
    exists(filepath)
    {
        return fs.existsSync(filepath);
    }

    createDir(filepath)
    {
        fs.mkdirSync(filepath.substr(0, filepath.lastIndexOf("/")), { recursive: true });
    }

    readFile(filepath)
    {
        return fs.readFileSync(filepath);
    }

    writeFile(filepath, data = "", append = false)
    {
        if (!this.exists(filepath))
        {
            this.createDir(filepath);
        }

        if (append)
        {
            fs.writeFileSync(filepath, data, { "flag": "a" });
        }
        else
        {
            fs.writeFileSync(filepath, data);
        }
    }

    removeFile(filepath)
    {
        fs.unlinkSync(filepath);
    }

    removeDir(dir)
    {
        const files = fs.readdirSync(dir);

        for (const file of files)
        {
            const filepath = path.join(dir, file);

            if (fs.statSync(filepath).isDirectory())
            {
                this.removeDir(filepath);
            }
            else
            {
                this.removeFile(filepath);
            }
        }

        fs.rmdirSync(dir);
    }

    getFiles(filepath)
    {
        return fs.readdirSync(filepath).filter((file) =>
        {
            return fs.statSync(`${filepath}/${file}`).isFile();
        });
    }

    getDirs(filepath)
    {
        return fs.readdirSync(filepath).filter((file) =>
        {
            return fs.statSync(`${filepath}/${file}`).isDirectory();
        });
    }
}

module.exports.VFS = VFS;
