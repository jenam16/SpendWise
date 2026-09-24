import { Subscription } from '../models/Subscription.js'

// Helper to convert subscription cost to its monthly equivalent
export const calculateMonthlyEquivalent = (amount, billingCycle) => {
  const num = Number(amount) || 0
  switch (billingCycle?.toLowerCase()) {
    case 'weekly':
      return Number(((num * 52) / 12).toFixed(2))
    case 'quarterly':
      return Number((num / 3).toFixed(2))
    case 'yearly':
      return Number((num / 12).toFixed(2))
    case 'monthly':
    default:
      return num
  }
}

// @desc    Get all subscriptions with filters
// @route   GET /api/subscriptions
// @access  Private
export const getSubscriptions = async (req, res, next) => {
  try {
    const { category, billingCycle, status } = req.query
    const userId = req.user._id

    const query = { user: userId }

    if (category && category !== 'all') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') }
    }

    if (billingCycle && billingCycle !== 'all') {
      query.billingCycle = billingCycle.toLowerCase()
    }

    if (status && status !== 'all') {
      query.status = status.toLowerCase()
    }

    const subscriptions = await Subscription.find(query).sort({ renewalDate: 1 })

    // Add monthly equivalent helper property
    const enriched = subscriptions.map((s) => ({
      ...s.toObject(),
      monthlyEquivalent: calculateMonthlyEquivalent(s.amount, s.billingCycle),
    }))

    res.json({
      success: true,
      data: enriched,
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get subscription summary metrics (Active count, monthly cost, annual projection, upcoming renewals)
// @route   GET /api/subscriptions/summary
// @access  Private
export const getSubscriptionSummary = async (req, res, next) => {
  try {
    const userId = req.user._id
    const allSubs = await Subscription.find({ user: userId })

    const activeSubs = allSubs.filter((s) => s.status === 'active')
    const activeCount = activeSubs.length

    // Calculate monthly and yearly cost estimates
    const monthlyCost = activeSubs.reduce((acc, s) => {
      return acc + calculateMonthlyEquivalent(s.amount, s.billingCycle)
    }, 0)

    const yearlyEstimate = Number((monthlyCost * 12).toFixed(2))

    // Upcoming renewals sorted by nearest renewalDate
    const upcomingRenewals = await Subscription.find({
      user: userId,
      status: 'active',
    })
      .sort({ renewalDate: 1 })
      .limit(5)
      .lean()

    res.json({
      success: true,
      data: {
        activeCount,
        totalCount: allSubs.length,
        monthlyCost: Number(monthlyCost.toFixed(2)),
        yearlyCost: yearlyEstimate,
        yearlyEstimate,
        upcomingRenewals,
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Get single subscription by ID
// @route   GET /api/subscriptions/:id
// @access  Private
export const getSubscriptionById = async (req, res, next) => {
  try {
    const subscription = await Subscription.findOne({ _id: req.params.id, user: req.user._id })
    if (!subscription) {
      return res.status(404).json({ success: false, message: 'Subscription not found' })
    }

    res.json({
      success: true,
      data: {
        ...subscription.toObject(),
        monthlyEquivalent: calculateMonthlyEquivalent(subscription.amount, subscription.billingCycle),
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Create new subscription
// @route   POST /api/subscriptions
// @access  Private
export const createSubscription = async (req, res, next) => {
  try {
    const { name, provider, amount, billingCycle = 'monthly', category, paymentMethod, startDate, renewalDate, status = 'active', notes } = req.body

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Subscription name is required' })
    }

    const numAmount = Number(amount)
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0' })
    }

    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category is required' })
    }

    if (!paymentMethod || !paymentMethod.trim()) {
      return res.status(400).json({ success: false, message: 'Payment method is required' })
    }

    if (!renewalDate) {
      return res.status(400).json({ success: false, message: 'Renewal date is required' })
    }

    const parsedRenewal = new Date(renewalDate)
    if (isNaN(parsedRenewal.getTime())) {
      return res.status(400).json({ success: false, message: 'Invalid renewal date' })
    }

    const sub = await Subscription.create({
      name: name.trim(),
      provider: provider ? provider.trim() : '',
      amount: numAmount,
      billingCycle: billingCycle.toLowerCase(),
      category: category.trim(),
      paymentMethod: paymentMethod.trim(),
      startDate: startDate ? new Date(startDate) : new Date(),
      renewalDate: parsedRenewal,
      status: status.toLowerCase(),
      notes: notes ? notes.trim() : '',
      user: req.user._id,
    })

    res.status(201).json({
      success: true,
      message: 'Subscription created successfully',
      data: {
        ...sub.toObject(),
        monthlyEquivalent: calculateMonthlyEquivalent(sub.amount, sub.billingCycle),
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Update existing subscription
// @route   PUT /api/subscriptions/:id
// @access  Private
export const updateSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOne({ _id: req.params.id, user: req.user._id })
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' })
    }

    const { name, provider, amount, billingCycle, category, paymentMethod, startDate, renewalDate, status, notes } = req.body

    if (name !== undefined) {
      if (!name || !name.trim()) {
        return res.status(400).json({ success: false, message: 'Name cannot be empty' })
      }
      sub.name = name.trim()
    }

    if (amount !== undefined) {
      const numAmount = Number(amount)
      if (isNaN(numAmount) || numAmount <= 0) {
        return res.status(400).json({ success: false, message: 'Amount must be greater than 0' })
      }
      sub.amount = numAmount
    }

    if (billingCycle !== undefined) {
      if (!['weekly', 'monthly', 'quarterly', 'yearly'].includes(billingCycle.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Invalid billing cycle' })
      }
      sub.billingCycle = billingCycle.toLowerCase()
    }

    if (category !== undefined) {
      if (!category || !category.trim()) {
        return res.status(400).json({ success: false, message: 'Category cannot be empty' })
      }
      sub.category = category.trim()
    }

    if (paymentMethod !== undefined) {
      if (!paymentMethod || !paymentMethod.trim()) {
        return res.status(400).json({ success: false, message: 'Payment method cannot be empty' })
      }
      sub.paymentMethod = paymentMethod.trim()
    }

    if (renewalDate !== undefined) {
      const d = new Date(renewalDate)
      if (isNaN(d.getTime())) {
        return res.status(400).json({ success: false, message: 'Invalid renewal date' })
      }
      sub.renewalDate = d
    }

    if (startDate !== undefined) {
      sub.startDate = new Date(startDate)
    }

    if (status !== undefined) {
      if (!['active', 'cancelled', 'paused'].includes(status.toLowerCase())) {
        return res.status(400).json({ success: false, message: 'Status must be active, cancelled, or paused' })
      }
      sub.status = status.toLowerCase()
    }

    if (provider !== undefined) {
      sub.provider = provider ? provider.trim() : ''
    }

    if (notes !== undefined) {
      sub.notes = notes ? notes.trim() : ''
    }

    await sub.save()

    res.json({
      success: true,
      message: 'Subscription updated successfully',
      data: {
        ...sub.toObject(),
        monthlyEquivalent: calculateMonthlyEquivalent(sub.amount, sub.billingCycle),
      },
    })
  } catch (error) {
    next(error)
  }
}

// @desc    Delete subscription
// @route   DELETE /api/subscriptions/:id
// @access  Private
export const deleteSubscription = async (req, res, next) => {
  try {
    const sub = await Subscription.findOneAndDelete({ _id: req.params.id, user: req.user._id })
    if (!sub) {
      return res.status(404).json({ success: false, message: 'Subscription not found' })
    }

    res.json({
      success: true,
      message: 'Subscription deleted successfully',
      data: { id: req.params.id },
    })
  } catch (error) {
    next(error)
  }
}
