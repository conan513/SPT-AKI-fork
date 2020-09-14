"use strict";

class ResponseController
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

module.exports.responseController = new ResponseController();
