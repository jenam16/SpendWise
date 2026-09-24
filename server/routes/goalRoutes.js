import express from 'express'
import {
  getGoals,
  getGoalById,
  createGoal,
  updateGoal,
  deleteGoal,
  addContribution,
} from '../controllers/goalController.js'

const router = express.Router()

router.route('/').get(getGoals).post(createGoal)
router.route('/:id').get(getGoalById).put(updateGoal).delete(deleteGoal)
router.route('/:id/contributions').post(addContribution)

export default router
