/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

const NoteController = require("../controllers/NoteController");

class NoteCallbacks
{
    static addNote(pmcData, body, sessionID)
    {
        return NoteController.addNote(pmcData, body, sessionID);
    }

    static editNote(pmcData, body, sessionID)
    {
        return NoteController.editNote(pmcData, body, sessionID);
    }

    static deleteNote(pmcData, body, sessionID)
    {
        return NoteController.deleteNote(pmcData, body, sessionID);
    }
}

module.exports = NoteCallbacks;
