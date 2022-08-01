import express from 'express'
import { chatPage } from '../controllers/chat.controllers.js'

const router = express.Router()

router.get('/',chatPage)

export default router