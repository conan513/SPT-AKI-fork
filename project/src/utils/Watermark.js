"use strict";

require("../Lib.js");

class Watermark
{
    static project = "SPT-AKI";
    static version = "1.4.1";
    static text = [];

    static initialize()
    {
        const osLocale = require('os-locale').sync();
        let description;
        let warning;
        switch(osLocale){
            case "en-US":
                description = [
                    "https://www.guilded.gg/senkospub",
                    "",
                    "This work is free of charge",
                    "Commercial use is prohibited"
                ];
                warning = [
                    "",
                    "NO SUPPORT FOR THIS BUILD",
                    "USE AT YOUR OWN RISK"
                ];
                break;
            case "zh-CN":
                description = [
                    "https://www.guilded.gg/senkospub",
                    "https://sns.oddba.cn",
                    "",
                    "本作品完全免费，禁止用于商业用途"
                ];
                warning = [
                    "",
                    "当前版本无可用技术支持",
                    "请自行承担使用风险"
                ];
                break;
            default:
                description = [
                    "https://www.guilded.gg/senkospub",
                    "",
                    "This work is free of charge",
                    "Commercial use is prohibited"
                ];
                warning = [
                    "",
                    "NO SUPPORT FOR THIS BUILD",
                    "USE AT YOUR OWN RISK"
                ];
                break;
        }

        if (globalThis.G_DEBUG_CONFIGURATION)
        {
            Watermark.version = `${Watermark.version}-BLEEDINGEDGE`;
        }

        Watermark.text = [`${Watermark.project} ${Watermark.version}`];
        Watermark.text = [...Watermark.text, ...description];

        if (globalThis.G_DEBUG_CONFIGURATION)
        {
            Watermark.text = [...Watermark.text, ...warning];
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
        let longestLength = Watermark.text.reduce((a, b) =>
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

        for (let text of Watermark.text)
        {
            let spacingSize = longestLength - Watermark.textLength(text);
            let spacingText = text;

            for (let i = 0; i < spacingSize; ++i)
            {
                spacingText += " ";
            }

            result.push(`│ ${spacingText} │`);
        }

        result.push(`└─${line}─┘`);

        // draw the watermark
        for (let text of result)
        {
            Logger.log(text, "yellow");
        }
    }

    /** Caculate text length */
    static textLength(str){
        let tmpStrArr = str.split("");
        let strLength = 0;
        for (let char of tmpStrArr)
        {
            if (encodeURI(char).split(/%..|./).length - 1 > 1)
                strLength += 2;
            else
                strLength++;
        }
        return strLength;
    }
}

module.exports = Watermark;
