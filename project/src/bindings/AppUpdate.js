const DialogueCallbacks = require("../callbacks/DialogueCallbacks");
const HideoutCallbacks = require("../callbacks/HideoutCallbacks");
const InsuranceCallbacks = require("../callbacks/InsuranceCallbacks");
const RagfairCallbacks = require("../callbacks/RagfairCallbacks");
const SaveCallbacks = require("../callbacks/SaveCallbacks");
const TraderCallbacks = require("../callbacks/TraderCallbacks");

module.exports = {
    "aki-dialogue": DialogueCallbacks.update,
    "aki-hideout": HideoutCallbacks.update,
    "aki-insurance": InsuranceCallbacks.update,
    "aki-ragfair-offers": RagfairCallbacks.update,
    "aki-ragfair-player": RagfairCallbacks.updatePlayer,
    "aki-traders": TraderCallbacks.update,
    "aki-save": SaveCallbacks.update
};
