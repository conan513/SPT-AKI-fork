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
    static addNote(pmcData, body, sessionID)
    {
        return note_f.controller.addNote(pmcData, body, sessionID);
    }

    static editNote(pmcData, body, sessionID)
    {
        return note_f.controller.editNote(pmcData, body, sessionID);
    }

    static deleteNote(pmcData, body, sessionID)
    {
        return note_f.controller.deleteNote(pmcData, body, sessionID);
    }
}

module.exports = NoteCallbacks;
