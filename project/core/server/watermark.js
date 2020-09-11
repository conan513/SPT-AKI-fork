"use strict";

function show()
{
    let text_1 = "SPT-AKI " + server.version;
    let text_2 = "https://guilded.gg/senkospub";
    let diffrence = Math.abs(text_1.length - text_2.length);
    let whichIsLonger = ((text_1.length >= text_2.length) ? text_1.length : text_2.length);
    let box_spacing_between_1 = "";
    let box_spacing_between_2 = "";
    let box_width = "";

    /* calculate space */
    if (text_1.length >= text_2.length)
    {
        for (let i = 0; i < diffrence; i++)
        {
            box_spacing_between_2 += " ";
        }
    }
    else
    {
        for (let i = 0; i < diffrence; i++)
        {
            box_spacing_between_1 += " ";
        }
    }

    for (let i = 0; i < whichIsLonger; i++)
    {
        box_width += "─";
    }

    /* reset cursor to begin */
    process.stdout.write("\u001B[2J\u001B[0;0f");

    /* show watermark */
    logger.logLogo("┌─" + box_width + "─┐");
    logger.logLogo("│ " + text_1 + box_spacing_between_1 + " │");
    logger.logLogo("│ " + text_2 + box_spacing_between_2 + " │");
    logger.logLogo("└─" + box_width + "─┘");

    /* set window name */
    process.title = text_1;
}

module.exports.show = show;
