import { getUsers } from '../controllers/usersControllers.js'
import express from 'express'

const router = express.Router()

router.get('/', getUsers)

export default router