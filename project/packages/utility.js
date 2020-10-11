/* utility.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const fs = require("fs");

function createDir(file)
{
    let filePath = file.substr(0, file.lastIndexOf("/"));

    if (!fs.existsSync(filePath))
    {
        fs.mkdirSync(filePath, { recursive: true });
    }
}

function clearString(s)
{
    return s.replace(/[\b]/g, "")
        .replace(/[\f]/g, "")
        .replace(/[\n]/g, "")
        .replace(/[\r]/g, "")
        .replace(/[\t]/g, "")
        .replace(/[\\]/g, "");
}

function getRandomInt(min = 0, max = 100)
{
    min = Math.ceil(min);
    max = Math.floor(max);
    return (max > min) ? Math.floor(Math.random() * (max - min + 1) + min) : min;
}

function getRandomIntEx(max)
{
    return (max > 1) ? Math.floor(Math.random() * (max - 2) + 1) : 1;
}

function getRandomFloat(min, max)
{
    return Math.random() * (max - min) + min;
}

function getRandomBool()
{
    return Math.random() < 0.5;
}

function getRandomValue(node)
{
    let keys = Object.keys(node);
    return node[keys[getRandomInt(0, keys.length - 1)]];
}

function getRandomArrayValue(arr)
{
    return arr[getRandomInt(0, arr.length - 1)];
}

function getFileList(path)
{
    return fs.readdirSync(path).filter((file) =>
    {
        return fs.statSync(`${path}/${file}`).isFile();
    });
}

function getDirList(path)
{
    return fs.readdirSync(path).filter((file) =>
    {
        return fs.statSync(`${path}/${file}`).isDirectory();
    });
}

function removeDir(dir)
{
    for (file of fs.readdirSync(dir))
    {
        let curPath = path.join(dir, file);

        if (fs.lstatSync(curPath).isDirectory())
        {
            removeDir(curPath);
        }
        else
        {
            fs.unlinkSync(curPath);
        }
    }

    fs.rmdirSync(dir);
}

function getServerUptimeInSeconds()
{
    return Math.floor(process.uptime());
}

function formatTime(date)
{
    let hours = ("0" + date.getHours()).substr(-2);
    let minutes = ("0" + date.getMinutes()).substr(-2);
    let seconds = ("0" + date.getSeconds()).substr(-2);
    return hours + "-" + minutes + "-" + seconds;
}

function formatDate(date)
{
    let day = ("0" + date.getDate()).substr(-2);
    let month = ("0" + (date.getMonth() + 1)).substr(-2);
    return date.getFullYear() + "-" + month + "-" + day;
}

function getDate()
{
    return formatDate(new Date());
}

function getTime()
{
    return formatTime(new Date());
}

function getTimestamp()
{
    return Math.floor(new Date() / 1000);
}

function generateNewId(prefix)
{
    let result = prefix;
    const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
    const length = 24 - prefix.length;

    for (let i = 0; i < length; i++)
    {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }

    return result;
}

function generateNewAccountId()
{
    return generateNewId("AID");
}

function generateNewItemId()
{
    return generateNewId("I");
}

function generateNewDialogueId()
{
    return generateNewId("D");
}

function generateNewBotId()
{
    return generateNewId("B");
}

module.exports.createDir = createDir;
module.exports.clearString = clearString;
module.exports.getRandomInt = getRandomInt;
module.exports.getRandomIntEx = getRandomIntEx;
module.exports.getRandomFloat = getRandomFloat;
module.exports.getRandomBool = getRandomBool;
module.exports.getRandomValue = getRandomValue;
module.exports.getRandomArrayValue = getRandomArrayValue;
module.exports.getFileList = getFileList;
module.exports.getDirList = getDirList;
module.exports.removeDir = removeDir;
module.exports.getServerUptimeInSeconds = getServerUptimeInSeconds;
module.exports.getTimestamp = getTimestamp;
module.exports.getTime = getTime;
module.exports.formatTime = formatTime;
module.exports.getDate = getDate;
module.exports.formatDate = formatDate;
module.exports.generateNewAccountId = generateNewAccountId;
module.exports.generateNewItemId = generateNewItemId;
module.exports.generateNewDialogueId = generateNewDialogueId;
module.exports.generateNewBotId = generateNewBotId;
