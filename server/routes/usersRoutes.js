import { getUsers, getSingleUser, authUser, updateUserStatus } from '../controllers/usersControllers.js'
import express from 'express'
import { protect } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/login', authUser)
router.get('/', protect, getUsers)
router.get('/:id', protect, getSingleUser)
router.patch('/:id/status', protect, updateUserStatus)

export default router