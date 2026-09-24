import express from 'express'
import {
  getDebts,
  getDebtById,
  createDebt,
  updateDebt,
  deleteDebt,
  recordPayment,
} from '../controllers/debtController.js'

const router = express.Router()

router.route('/').get(getDebts).post(createDebt)
router.route('/:id').get(getDebtById).put(updateDebt).delete(deleteDebt)
router.route('/:id/payment').post(recordPayment)

export default router
