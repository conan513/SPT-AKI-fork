/* common_f.logger.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

const util = require("util");

class Logger
{
    constructor()
    {
        this.filepath = "user/logs/server.log";
        this.colors = {
            "front": {
                "black": "\x1b[30m",
                "red": "\x1b[31m",
                "green": "\x1b[32m",
                "yellow": "\x1b[33m",
                "blue": "\x1b[34m",
                "magenta": "\x1b[35m",
                "cyan": "\x1b[36m",
                "white": "\x1b[37m"
            },
            "back": {
                "black": "\x1b[40m",
                "red": "\x1b[41m",
                "green": "\x1b[42m",
                "yellow": "\x1b[43m",
                "blue": "\x1b[44m",
                "magenta": "\x1b[45m",
                "cyan": "\x1b[46m",
                "white": "\x1b[47m"
            }
        };
        this.showDebug = 1;

        this.setupExceptions();
    }

    setupExceptions()
    {
        process.on("uncaughtException", (error, promise) =>
        {
            this.logError("Trace:");
            this.log(error);
        });
    }

    log(data, front = "", back = "")
    {
        // set colors
        const colors = `${(this.colors.front[front] || "")}${this.colors.back[back] || ""}`;

        // show logged message
        if (colors)
        {
            console.log(`${colors}${data}\x1b[0m`);
        }
        else
        {
            console.log(data);
        }

        // save logged message
        common_f.vfs.writeFile(this.filepath, `${util.format(data)}\n`, true);
    }

    logError(data)
    {
        this.log(`[ERROR] ${data}`, "white", "red");
    }

    logWarning(data)
    {
        this.log(`[WARNING] ${data}`, "white", "yellow");
    }

    logSuccess(data)
    {
        this.log(`[SUCCESS] ${data}`, "white", "green");
    }

    logInfo(data)
    {
        this.log(`[INFO] ${data}`, "cyan", "black");
    }

    logDebug(data, isError = false)
    {
        if (this.showDebug)
        {
            this.log(`[DEBUG] ${data}`, (isError) ? "red" : "green", "black");
        }
    }

}

module.exports = new Logger();
