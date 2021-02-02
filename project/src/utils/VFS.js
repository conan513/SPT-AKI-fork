/* vfs.js
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
    static exists(filepath)
    {
        return fs.existsSync(filepath);
    }

    static rename(filepath, target)
    {
        fs.renameSync(filepath, target);
    }

    static copyFile(filepath, target)
    {
        fs.copyFileSync(filepath, target);
    }

    static createDir(filepath)
    {
        fs.mkdirSync(filepath.substr(0, filepath.lastIndexOf("/")), { "recursive": true });
    }

    static copyDir(filepath, target)
    {
        const files = this.getFiles(filepath);
        const dirs = this.getDirs(filepath);

        if (!this.exists(target))
        {
            VFS.createDir(`${target}/`);
        }

        for (const dir of dirs)
        {
            VFS.copyDir(path.join(filepath, dir), path.join(target, dir));
        }

        for (const file of files)
        {
            VFS.copyFile(path.join(filepath, file), path.join(target, file));
        }
    }

    static readFile(filepath)
    {
        return fs.readFileSync(filepath);
    }

    static writeFile(filepath, data = "", append = false)
    {
        const options = (append) ? { "flag": "a" } : { "flag": "w" };

        if (!VFS.exists(filepath))
        {
            VFS.createDir(filepath);
        }

        fs.writeFileSync(filepath, data, options);
    }

    static getFiles(filepath)
    {
        return fs.readdirSync(filepath).filter((item) =>
        {
            return fs.statSync(path.join(filepath, item)).isFile();
        });
    }

    static getDirs(filepath)
    {
        return fs.readdirSync(filepath).filter((item) =>
        {
            return fs.statSync(path.join(filepath, item)).isDirectory();
        });
    }

    static removeFile(filepath)
    {
        fs.unlinkSync(filepath);
    }

    static removeDir(filepath)
    {
        const files = VFS.getFiles(filepath);
        const dirs = VFS.getDirs(filepath);

        for (const dir of dirs)
        {
            VFS.removeDir(path.join(filepath, dir));
        }

        for (const file of files)
        {
            VFS.removeFile(path.join(filepath, file));
        }

        fs.rmdirSync(filepath);
    }
}

module.exports = VFS;
