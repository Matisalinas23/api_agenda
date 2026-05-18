import express from 'express'
import { getAllNotes, createNote, updateNote, deleteNote, orderNotesByAssignature, orderNotesByDate } from './note.controller'
import { authMiddleware } from '../../middleweres/authMiddleware'
import { validateUserIdMiddleware } from '../../middleweres/validateUserIdMiddleware'

const router = express.Router()

router.get('/:userId/orderByAssignature', authMiddleware, validateUserIdMiddleware, orderNotesByAssignature)
router.get('/:userId/orderByDate', authMiddleware, validateUserIdMiddleware, orderNotesByDate)
router.put('/:id', authMiddleware, updateNote)
router.delete('/:id', authMiddleware, deleteNote)
router.post('/:userId', authMiddleware, validateUserIdMiddleware, createNote)
router.get('/', authMiddleware, getAllNotes)

export default router