/* controller.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 */

"use strict";

class NoteController
{
    addNote(pmcData, body, sessionID)
    {
        pmcData.Notes.Notes.push({
            "Time": body.note.Time,
            "Text": body.note.Text
        });

        return item_f.eventHandler.getOutput();
    }

    editNote(pmcData, body, sessionID)
    {
        pmcData.Notes.Notes[body.index] = {
            "Time": body.note.Time,
            "Text": body.note.Text
        };

        return item_f.eventHandler.getOutput();
    }

    deleteNote(pmcData, body, sessionID)
    {
        pmcData.Notes.Notes.splice(body.index, 1);
        return item_f.eventHandler.getOutput();
    }
}

module.exports = NoteController;
