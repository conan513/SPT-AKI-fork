/* response.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class Controller
{
    noBody(data)
    {
        return utility.clearString(json.stringify(data));
    }

    getBody(data, err = 0, errmsg = null)
    {
        return utility.clearString(this.getUnclearedBody(data, err, errmsg));
    }

    getUnclearedBody(data, err = 0, errmsg = null)
    {
        return json.stringify({"err": err, "errmsg": errmsg, "data": data});
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

module.exports.controller = new Controller();
