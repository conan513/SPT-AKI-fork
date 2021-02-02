const CertCallbacks = require("../callbacks/CertCallbacks");
const HttpCallbacks = require("../callbacks/HttpCallbacks");
const ModCallbacks = require("../callbacks/ModCallbacks");

module.exports = {
    "CERT_BIN": CertCallbacks.sendBinary,
    "IMAGE": HttpCallbacks.sendImage,
    "BUNDLE": ModCallbacks.sendBundle,
};
