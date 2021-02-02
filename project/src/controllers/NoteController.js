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
    static addNote(pmcData, body, sessionID)
    {
        pmcData.Notes.Notes.push({
            "Time": body.note.Time,
            "Text": body.note.Text
        });

        return item_f.eventHandler.getOutput();
    }

    static editNote(pmcData, body, sessionID)
    {
        pmcData.Notes.Notes[body.index] = {
            "Time": body.note.Time,
            "Text": body.note.Text
        };

        return item_f.eventHandler.getOutput();
    }

    static deleteNote(pmcData, body, sessionID)
    {
        pmcData.Notes.Notes.splice(body.index, 1);
        return item_f.eventHandler.getOutput();
    }
}

module.exports = NoteController;
