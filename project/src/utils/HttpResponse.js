/* response.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class HttpResponse
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
        return this.clearString(JsonUtil.serialize(data));
    }

    getBody(data, err = 0, errmsg = null)
    {
        return this.clearString(this.getUnclearedBody(data, err, errmsg));
    }

    getUnclearedBody(data, err = 0, errmsg = null)
    {
        return JsonUtil.serialize({
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

    /**
     * @param {apiEventResponse} output
     */
    appendErrorToOutput(output, message = "An unknown error occurred", title = "Error")
    {
        output.badRequest = [{
            "index": 0,
            "err": title,
            "errmsg": message
        }];

        return output;
    }
}

module.exports = new HttpResponse();
