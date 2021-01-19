/* common_f.random.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class RandomUtil
{
    getInt(min, max)
    {
        min = Math.ceil(min);
        max = Math.floor(max);
        return (max > min) ? Math.floor(Math.random() * (max - min + 1) + min) : min;
    }

    getIntEx(max)
    {
        return (max > 1) ? Math.floor(Math.random() * (max - 2) + 1) : 1;
    }

    getFloat(min, max)
    {
        return Math.random() * (max - min) + min;
    }

    getBool()
    {
        return Math.random() < 0.5;
    }

    getArrayValue(arr)
    {
        return arr[this.getInt(0, arr.length - 1)];
    }

    getKey(node)
    {
        return this.getArrayValue(Object.keys(node));
    }

    getKeyValue(node)
    {
        return node[this.getArrayValue(Object.keys(node))];
    }
}

module.exports = new RandomUtil();
