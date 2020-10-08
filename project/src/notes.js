/* notes.js
 * license: NCSA
 * copyright: Senko's Pub
 * website: https://www.guilded.gg/senkospub
 * authors:
 * - Senko-san (Merijn Hendriks)
 * - BALIST0N
 */

"use strict";

class Controller
{
    addNote(pmcData, body, sessionID)
    {
        pmcData.Notes.Notes.push({
            "Time": body.note.Time,
            "Text": body.note.Text
        });

        return item_f.router.getOutput();
    }

    editNode(pmcData, body, sessionID)
    {
        pmcData.Notes.Notes[body.index] = {
            "Time": body.note.Time,
            "Text": body.note.Text
        };

        return item_f.router.getOutput();
    }

    deleteNote(pmcData, body, sessionID)
    {
        pmcData.Notes.Notes.splice(body.index, 1);
        return item_f.router.getOutput();
    }
}

class Callbacks
{
    constructor()
    {
        item_f.router.routes["AddNote"] = this.addNote.bind();
        item_f.router.routes["EditNote"] = this.editNote.bind();
        item_f.router.routes["DeleteNote"] = this.deleteNote.bind();
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

module.exports.controller = new Controller();
module.exports.callbacks = new Callbacks();
