"use strict";

require("../Lib.js");

class Watermark
{
    static project = "SPT-AKI";
    static version = "1.4.0";
    static url = "https://www.guilded.gg/senkospub";
    static text = [];

    static initialize()
    {
        if (globalThis.G_DEBUG_CONFIGURATION)
        {
            Watermark.version = `${Watermark.version}-BLEEDINGEDGE`;
        }

        Watermark.text = [
            `${Watermark.project} ${Watermark.version}`,
            `${Watermark.url}`,
        ];

        if (globalThis.G_DEBUG_CONFIGURATION)
        {
            const text = [
                "",
                "NO SUPPORT FOR THIS BUILD",
                "USE AT YOUR OWN RISK"
            ];

            Watermark.text = [...Watermark.text, ...text];
        }
    }

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
            Logger.log(text, "yellow");
        }
    }
}

module.exports = Watermark;
