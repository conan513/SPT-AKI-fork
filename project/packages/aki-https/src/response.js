/* response.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Response
{
    clearString(s)
    {
        return s.replace(/[\b]/g, "")
            .replace(/[\f]/g, "")
            .replace(/[\n]/g, "")
            .replace(/[\r]/g, "")
            .replace(/[\t]/g, "")
            .replace(/[\\]/g, "");
    }

    noBody(data)
    {
        return this.clearString(common_f.json.serialize(data));
    }

    getBody(data, err = 0, errmsg = null)
    {
        return this.clearString(this.getUnclearedBody(data, err, errmsg));
    }

    getUnclearedBody(data, err = 0, errmsg = null)
    {
        return common_f.json.serialize({
            "err": err,
            "errmsg": errmsg,
            "data": data
        });
    }

    emptyResponse()
    {
        const data = "";
        const errmsg = "";
        return this.getBody(data, 0, errmsg);
    }

    nullResponse()
    {
        return this.getBody(null);
    }

    emptyArrayResponse()
    {
        return this.getBody([]);
    }
}

module.exports.Response = Response;
