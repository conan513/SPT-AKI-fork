"use strict";

require("../Lib.js");

module.exports = {
    "aki-database": DatabaseImporter.load,
    "aki-handbook": HandbookCallbacks.load,
    "aki-certs": CertCallbacks.load,
    "aki-https": HttpCallbacks.load,
    "aki-mods": ModCallbacks.load,
    "aki-presets": PresetCallbacks.load,
    "aki-ragfair": RagfairCallbacks.load,
    "aki-save": SaveCallbacks.load,
    "aki-traders": TraderCallbacks.load
};
