import express from 'express'
import { getReportPreview, downloadPdfReport } from '../controllers/reportController.js'

const router = express.Router()

router.get('/preview', getReportPreview)
router.get('/pdf', downloadPdfReport)

export default router
