import express from 'express'
import { getAllNotes, createNote, updateNote, deleteNote } from './note.controller'
import { authMiddleware } from '../../middleweres/authMiddleware'

const router = express.Router()

router.put('/:id', authMiddleware, updateNote)
router.delete('/:id', authMiddleware, deleteNote)
router.get('/', authMiddleware, getAllNotes)
router.post('/', authMiddleware, createNote)

export default router