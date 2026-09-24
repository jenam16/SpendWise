import express from 'express'
import { handleAIQuery, parseTransaction } from '../controllers/aiController.js'

const router = express.Router()

router.post('/query', handleAIQuery)
router.post('/parse-transaction', parseTransaction)

export default router
