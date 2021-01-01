/* watermark.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Watermark
{
    constructor()
    {
        this.name = "SPT-AKI";
        this.version = "R8";
        this.url = "https://www.guilded.gg/senkospub";
        this.colors = {
            "front": "\x1b[33m",    // gold
            "back": "\x1b[40m"      // black
        };
        this.text = [
            `${this.name} ${this.version}`,
            `${this.url}`
        ];
    }

    /** Set window title */
    setTitle()
    {
        process.title = `${this.name} ${this.version}`;
    }

    /** Reset console cursor to top */
    resetCursor()
    {
        process.stdout.write("\u001B[2J\u001B[0;0f");
    }

    /** Draw the watermark */
    draw()
    {
        let result = [];

        // calculate size
        const longestLength = this.text.reduce((a, b) =>
        {
            return a.length > b.length ? a : b;
        }).length;

        // get top-bottom line
        let line = "";

        for (let i = 0; i < longestLength; ++i)
        {
            line += "─";
        }

        // get watermark to draw
        result.push(`┌─${line}─┐`);

        for (const text of this.text)
        {
            const spacingSize = longestLength - text.length;
            let spacingText = text;

            for (let i = 0; i < spacingSize; ++i)
            {
                spacingText += " ";
            }

            result.push(`│ ${spacingText} │`);
        }

        result.push(`└─${line}─┘`);

        // draw the watermark
        for (const text of result)
        {
            console.log(`${this.colors.front + this.colors.back}${text}\x1b[0m`);
        }
    }
}

module.exports.instance = new Watermark();
