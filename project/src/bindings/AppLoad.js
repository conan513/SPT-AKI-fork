const DatabaseImporter = require("../utils/DatabaseImporter");
const CertCallbacks = require("../callbacks/CertCallbacks");
const HttpCallbacks = require("../callbacks/HttpCallbacks");
const ModCallbacks = require("../callbacks/ModCallbacks");
const PresetCallbacks = require("../callbacks/PresetCallbacks");
const RagfairCallbacks = require("../callbacks/RagfairCallbacks");
const SaveCallbacks = require("../callbacks/SaveCallbacks");
const TraderCallbacks = require("../callbacks/TraderCallbacks");

module.exports = {
    "aki-database": DatabaseImporter.load,
    "aki-certs": CertCallbacks.load,
    "aki-https": HttpCallbacks.load,
    "aki-mods": ModCallbacks.load,
    "aki-presets": PresetCallbacks.load,
    "aki-ragfair": RagfairCallbacks.load,
    "aki-save": SaveCallbacks.load,
    "aki-traders": TraderCallbacks.load
};
