import { getUsers, getSingleUser, authUser } from '../controllers/usersControllers.js'
import express from 'express'
import { protect, authorize } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/login', authUser)
router.get('/', protect, getUsers)
router.get('/:id', protect, getSingleUser)

export default router