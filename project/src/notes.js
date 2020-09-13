"use strict";

class NoteController
{
    addNote(pmcData, body, sessionID)
    {
        pmcData.Notes.Notes.push({
            "Time": body.note.Time,
            "Text": body.note.Text
        });

        return item_f.itemServer.getOutput();
    }

    editNode(pmcData, body, sessionID)
    {
        pmcData.Notes.Notes[body.index] = {
            "Time": body.note.Time,
            "Text": body.note.Text
        };

        return item_f.itemServer.getOutput();
    }

    deleteNote(pmcData, body, sessionID)
    {
        pmcData.Notes.Notes.splice(body.index, 1);
        return item_f.itemServer.getOutput();
    }
}

class NoteCallbacks
{
    constructor()
    {
        item_f.itemServer.addRoute("AddNote", this.addNote.bind());
        item_f.itemServer.addRoute("EditNote", this.editNote.bind());
        item_f.itemServer.addRoute("DeleteNote", this.deleteNote.bind());
    }

    addNote(pmcData, body, sessionID)
    {
        return note_f.notesController.addNote(pmcData, body, sessionID);
    }

    editNote(pmcData, body, sessionID)
    {
        return note_f.notesController.editNote(pmcData, body, sessionID);
    }

    deleteNote(pmcData, body, sessionID)
    {
        return note_f.notesController.deleteNote(pmcData, body, sessionID);
    }
}

module.exports.noteController = new NoteController();
module.exports.noteCallbacks = new NoteCallbacks();
