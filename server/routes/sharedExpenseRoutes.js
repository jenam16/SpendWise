import express from 'express'
import {
  getSharedExpenses,
  getSharedExpenseById,
  createSharedExpense,
  updateSharedExpense,
  deleteSharedExpense,
  settleParticipant,
} from '../controllers/sharedExpenseController.js'

const router = express.Router()

router.route('/').get(getSharedExpenses).post(createSharedExpense)
router.route('/:id').get(getSharedExpenseById).put(updateSharedExpense).delete(deleteSharedExpense)
router.route('/:id/settle').post(settleParticipant)

export default router
