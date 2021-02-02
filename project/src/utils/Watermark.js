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
    static project = "SPT-AKI";
    static version = "BLEEDINGEDGE-A8";
    static url = "https://www.guilded.gg/senkospub";
    static colors = {
        "front": "\x1b[33m",    // gold
        "back": "\x1b[40m"      // black
    };
    static text = [
        `${Watermark.project} ${Watermark.version}`,
        `${Watermark.url}`
    ];

    /** Set window title */
    static setTitle()
    {
        process.title = `${Watermark.project} ${Watermark.version}`;
    }

    /** Reset console cursor to top */
    static resetCursor()
    {
        process.stdout.write("\u001B[2J\u001B[0;0f");
    }

    /** Draw the watermark */
    static draw()
    {
        let result = [];

        // calculate size
        const longestLength = Watermark.text.reduce((a, b) =>
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

        for (const text of Watermark.text)
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
            console.log(`${Watermark.colors.front + Watermark.colors.back}${text}\x1b[0m`);
        }
    }
}

module.exports = Watermark;
