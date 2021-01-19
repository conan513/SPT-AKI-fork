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

    copyDir(filepath, target)
    {
        this.createDir(target);

        const files = this.getFiles(filepath);
        const dirs = this.getDirs(filepath);

        for (const dir of dirs)
        {
            this.copyDir(path.join(filepath, dir), path.join(target, dir));
        }

        for (const file of files)
        {
            this.copyFile(path.join(filepath, file), path.join(target, file));
        }

        fs.rmdirSync(filepath);
    }

    createDir(filepath)
    {
        fs.mkdirSync(filepath.substr(0, filepath.lastIndexOf("/")), { "recursive": true });
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

        const options = (append) ? { "flag": "a" } : { "flag": "w" };
        fs.writeFileSync(filepath, data, options);
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
