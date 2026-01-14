import express from 'express'
import { getAllNotes, createNote, updateNote, deleteNote } from './note.controller'

const router = express.Router()

router.put('/:id', updateNote)
router.delete('/:id', deleteNote)
router.get('/', getAllNotes)
router.post('/', createNote)

export default router