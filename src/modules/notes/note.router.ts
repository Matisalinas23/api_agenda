import express from 'express'
import { getAllNotes, createNote, updateNote, deleteNote, orderNotesByAssignature, orderNotesByDate } from './note.controller'
import { authMiddleware } from '../../middleweres/authMiddleware'

const router = express.Router()

router.get('/orderByAssignature', authMiddleware, orderNotesByAssignature)
router.get('/orderByDate', authMiddleware, orderNotesByDate)
router.put('/:id', authMiddleware, updateNote)
router.delete('/:id', authMiddleware, deleteNote)
router.post('/:id', authMiddleware, createNote)
router.get('/', authMiddleware, getAllNotes)

export default router