import { getUsers, getSingleUser, authUser, updateUserStatus } from '../controllers/usersControllers.js'
import express from 'express'
import { protect, authorize } from '../middlewares/authMiddleware.js'

const router = express.Router()

router.post('/login', authUser)
router.get('/', getUsers)
router.get('/:id', getSingleUser)
router.patch('/:id/status', updateUserStatus)

export default router