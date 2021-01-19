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

    rename(filepath, target)
    {
        fs.renameSync(filepath, target);
    }

    copyFile(filepath, target)
    {
        fs.copyFileSync(filepath, target);
    }

    createDir(filepath)
    {
        fs.mkdirSync(filepath.substr(0, filepath.lastIndexOf("/")), { "recursive": true });
    }

    copyDir(filepath, target)
    {
        const files = this.getFiles(filepath);
        const dirs = this.getDirs(filepath);

        if (!this.exists(target))
        {
            console.log(target)
            this.createDir(target);
        }

        for (const dir of dirs)
        {
            this.copyDir(path.join(filepath, dir), path.join(target, dir));
        }

        for (const file of files)
        {
            this.copyFile(path.join(filepath, file), path.join(target, file));
        }
    }

    readFile(filepath)
    {
        return fs.readFileSync(filepath);
    }

    writeFile(filepath, data = "", append = false)
    {
        const options = (append) ? { "flag": "a" } : { "flag": "w" };

        if (!this.exists(filepath))
        {
            this.createDir(filepath);
        }

        fs.writeFileSync(filepath, data, options);
    }

    getFiles(filepath)
    {
        return fs.readdirSync(filepath).filter((item) =>
        {
            return fs.statSync(path.join(filepath, item)).isFile();
        });
    }

    getDirs(filepath)
    {
        return fs.readdirSync(filepath).filter((item) =>
        {
            return fs.statSync(path.join(filepath, item)).isDirectory();
        });
    }

    removeFile(filepath)
    {
        fs.unlinkSync(filepath);
    }

    removeDir(filepath)
    {
        const files = this.getFiles(filepath);
        const dirs = this.getDirs(filepath);

        for (const dir of dirs)
        {
            this.removeDir(path.join(filepath, dir));
        }

        for (const file of files)
        {
            this.removeFile(path.join(filepath, file));
        }

        fs.rmdirSync(filepath);
    }
}

module.exports = new VFS();
