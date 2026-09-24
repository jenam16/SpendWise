import express from 'express'
import {
  getSubscriptions,
  getSubscriptionSummary,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
} from '../controllers/subscriptionController.js'

const router = express.Router()

router.get('/summary', getSubscriptionSummary)

router.route('/')
  .get(getSubscriptions)
  .post(createSubscription)

router.route('/:id')
  .get(getSubscriptionById)
  .put(updateSubscription)
  .delete(deleteSubscription)

export default router
