
class ResponseHelper
{
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
module.exports = new ResponseHelper();
