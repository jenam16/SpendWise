import express from 'express'
import {
  getRecurringExpenses,
  getRecurringExpenseById,
  createRecurringExpense,
  updateRecurringExpense,
  deleteRecurringExpense,
} from '../controllers/recurringExpenseController.js'

const router = express.Router()

router.route('/')
  .get(getRecurringExpenses)
  .post(createRecurringExpense)

router.route('/:id')
  .get(getRecurringExpenseById)
  .put(updateRecurringExpense)
  .delete(deleteRecurringExpense)

export default router
