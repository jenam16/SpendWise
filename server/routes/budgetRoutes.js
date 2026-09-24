import express from 'express'
import {
  getBudgets,
  getBudgetSummary,
  getBudgetById,
  createBudget,
  updateBudget,
  deleteBudget,
} from '../controllers/budgetController.js'

const router = express.Router()

// Summary route must precede /:id
router.get('/summary', getBudgetSummary)

// Collection routes
router.route('/')
  .get(getBudgets)
  .post(createBudget)

// Item routes
router.route('/:id')
  .get(getBudgetById)
  .put(updateBudget)
  .delete(deleteBudget)

export default router
