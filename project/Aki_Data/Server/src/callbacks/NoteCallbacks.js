/* callbacks.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 */

"use strict";

class NoteCallbacks
{
    constructor()
    {
        item_f.eventHandler.onEvent["AddNote"] = this.addNote.bind(this);
        item_f.eventHandler.onEvent["EditNote"] = this.editNote.bind(this);
        item_f.eventHandler.onEvent["DeleteNote"] = this.deleteNote.bind(this);
    }

    addNote(pmcData, body, sessionID)
    {
        return note_f.controller.addNote(pmcData, body, sessionID);
    }

    editNote(pmcData, body, sessionID)
    {
        return note_f.controller.editNote(pmcData, body, sessionID);
    }

    deleteNote(pmcData, body, sessionID)
    {
        return note_f.controller.deleteNote(pmcData, body, sessionID);
    }
}

module.exports = NoteCallbacks;
