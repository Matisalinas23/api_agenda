import { NextFunction, Request, Response } from "express";
import { createNoteServie, deleteNoteService, getAllNotesService, orderNoteByAssignatureService, updateNoteService } from "./note.service";

export const getAllNotes = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const notes = await getAllNotesService()
        res.status(200).json(notes)
    } catch (error) {
        next(error)
    }
}

export const createNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const note = await createNoteServie(req.body)
        res.status(201).json(note)
    } catch (error) {
        next(error)
    }
}

export const updateNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const updatedNote = await updateNoteService(req.body, req.params.id)
        res.status(200).json(updatedNote)
    } catch (error) {
        next(error)
    }
}

export const deleteNote = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const deletedNote = await deleteNoteService(req.params.id)
        res.status(200).json({
            message: "Note deleted successfully",
            note: deletedNote
        })
    } catch (error) {
        next(error)
    }
}

export const orderNotesByAssignature = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const notes = await orderNoteByAssignatureService()
        res.status(200).json(notes)
    } catch (error) {
        next(error)
    }
}
