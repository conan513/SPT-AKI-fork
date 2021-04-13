"use strict";

require("../Lib.js");

module.exports = {
    "CERT_BIN": CertCallbacks.sendBinary,
    "IMAGE": HttpCallbacks.sendImage,
    "BUNDLE": ModCallbacks.sendBundle,
    "NOTIFY": NotifierCallbacks.sendNotification
};
