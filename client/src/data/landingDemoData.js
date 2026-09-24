/**
 * SpendWise — Presentation-Only Demo Data for Public Landing Page
 * 
 * IMPORTANT:
 * This data is strictly for public UI visual storytelling.
 * It is never sent to backend APIs, never saved to MongoDB,
 * and never mixed with real authenticated user records.
 */

export const LANDING_HERO_STATS = {
  totalBalance: 148250,
  monthlyIncome: 85000,
  monthlyExpense: 36750,
  savingsRate: '56.8%',
  netSavings: 48250,
}

export const LANDING_TREND_DATA = [
  { month: 'Jan', income: 72000, expense: 41000 },
  { month: 'Feb', income: 72000, expense: 38500 },
  { month: 'Mar', income: 78000, expense: 44000 },
  { month: 'Apr', income: 78000, expense: 35200 },
  { month: 'May', income: 85000, expense: 39100 },
  { month: 'Jun', income: 85000, expense: 36750 },
]

export const LANDING_CATEGORIES = [
  { name: 'Housing & Bills', amount: 14500, percentage: 39.5, color: '#6366F1' },
  { name: 'Groceries & Dining', amount: 9200, percentage: 25.0, color: '#8B5CF6' },
  { name: 'Transport & Fuel', amount: 4800, percentage: 13.1, color: '#06B6D4' },
  { name: 'Subscriptions', amount: 3750, percentage: 10.2, color: '#EC4899' },
  { name: 'Shopping & Misc', amount: 4500, percentage: 12.2, color: '#F59E0B' },
]

export const LANDING_RECENT_TRANSACTIONS = [
  {
    id: 'ltx-1',
    title: 'Consulting Retainer Payment',
    category: 'Income',
    amount: 85000,
    type: 'income',
    date: 'Today, 10:30 AM',
    method: 'HDFC Bank',
  },
  {
    id: 'ltx-2',
    title: 'Nature Basket Organic Groceries',
    category: 'Groceries & Dining',
    amount: 3420,
    type: 'expense',
    date: 'Yesterday',
    method: 'UPI',
  },
  {
    id: 'ltx-3',
    title: 'AWS Cloud Infrastructure',
    category: 'Bills',
    amount: 2890,
    type: 'expense',
    date: '20 Sep 2026',
    method: 'Credit Card',
  },
  {
    id: 'ltx-4',
    title: 'Uber City Commute',
    category: 'Transport',
    amount: 460,
    type: 'expense',
    date: '19 Sep 2026',
    method: 'UPI',
  },
]

export const LANDING_FEATURES = [
  {
    id: 'expenses',
    name: 'Expenses',
    tagline: 'Precision Tracking',
    title: 'Know exactly where every rupee flows.',
    description:
      'Log expenses in seconds with payment methods, receipt attachments, and smart tags. Filter by date range, category, or payment channel with zero friction.',
    highlights: [
      'Instant search and multi-criteria filters',
      'UPI, Credit Card, and Cash categorization',
      'Optional receipt uploads with secure storage',
    ],
    previewData: {
      transactions: [
        { title: 'Whole Foods Market', category: 'Groceries', amount: 3240, type: 'expense', method: 'UPI', date: 'Today' },
        { title: 'Shell Petrol Station', category: 'Transport', amount: 1800, type: 'expense', method: 'Credit Card', date: 'Yesterday' },
        { title: 'Blue Tokai Coffee Roasters', category: 'Dining', amount: 450, type: 'expense', method: 'UPI', date: '21 Sep' },
        { title: 'Freelance UI Design Milestone', category: 'Salary', amount: 42000, type: 'income', method: 'Bank Transfer', date: '19 Sep' },
      ],
      totalLogged: '₹47,490',
      totalCount: 48,
    },
  },
  {
    id: 'budgets',
    name: 'Budgets',
    tagline: 'Proactive Guardrails',
    title: 'Set limits. Avoid month-end surprises.',
    description:
      'Create dynamic category budgets with proactive 80% and 100% threshold alerts. SpendWise links real transactions automatically so you never overspend blindly.',
    highlights: [
      'Automated transaction aggregation',
      'Configurable warning thresholds (default 80%)',
      'Real-time remaining allowance meters',
    ],
    previewData: {
      budgets: [
        { name: 'Dining & Food', limit: 12000, spent: 8400, percent: 70, status: 'On Track' },
        { name: 'Shopping & Tech', limit: 15000, spent: 13200, percent: 88, status: 'Near Limit' },
        { name: 'Local Transport', limit: 5000, spent: 3100, percent: 62, status: 'On Track' },
      ],
      totalBudgeted: '₹32,000',
      overallUsage: '77.2%',
    },
  },
  {
    id: 'analytics',
    name: 'Analytics',
    tagline: 'Deep Financial Insights',
    title: 'Turn numbers into clear behavioral patterns.',
    description:
      'Understand your net cash flow, highest expense drivers, and day-by-day spending velocity. Compare income against burn rate across custom date windows.',
    highlights: [
      'Income vs expense trend trajectory',
      'Category distribution and payment mix breakdowns',
      'Daily average burn velocity calculator',
    ],
    previewData: {
      avgDailySpend: 1225,
      highestExpense: { title: 'Annual Rent Advance', amount: 35000 },
      topCategory: { name: 'Housing & Rent', percent: '44%' },
    },
  },
  {
    id: 'goals',
    name: 'Savings Goals',
    tagline: 'Purpose-Driven Wealth',
    title: 'Target milestones and watch them grow.',
    description:
      'Set financial targets with deadlines, track milestone progress bars, and log individual deposits or emergency withdrawals with complete audit history.',
    highlights: [
      'Visual completion percentages and days remaining',
      'Deposit and withdrawal contribution audit trails',
      'Automatic status transitions upon milestone achievement',
    ],
    previewData: {
      goal: {
        name: 'Emergency Reserve Fund',
        target: 100000,
        current: 68500,
        percentage: 68.5,
        remainingDays: 45,
        recentContribution: '+₹10,000 on 15 Sep',
      },
    },
  },
  {
    id: 'subscriptions',
    name: 'Subscriptions',
    tagline: 'Recurring Clarity',
    title: 'Never get caught off guard by renewals.',
    description:
      'Audit all digital, streaming, and gym memberships in one place. View monthly equivalents, upcoming renewal countdowns, and projected annual commitments.',
    highlights: [
      'Automatic monthly equivalent normalization',
      'Upcoming renewal alerts 3 days in advance',
      'Annual commitment projection',
    ],
    previewData: {
      subs: [
        { name: 'Netflix 4K Premium', amount: 649, cycle: 'Monthly', renewsIn: 'in 4 days' },
        { name: 'Spotify Duo', amount: 149, cycle: 'Monthly', renewsIn: 'in 12 days' },
        { name: 'Google One 2TB Cloud', amount: 6500, cycle: 'Yearly', renewsIn: 'in 48 days' },
      ],
      monthlyTotal: '₹1,340',
      annualEstimate: '₹16,080',
    },
  },
  {
    id: 'shared',
    name: 'Shared Expenses',
    tagline: 'Collaborative Splitting',
    title: 'Split group expenses without awkward chats.',
    description:
      'Split weekend trips, rent, and dinner bills equally or by custom amounts. Track who paid, calculate remaining individual shares, and mark balances settled.',
    highlights: [
      'Equal and custom split math with zero rounding loss',
      'Clear individual payer vs debtor ledger',
      'Single-click settlement reconciliation',
    ],
    previewData: {
      trip: {
        title: 'Goa Weekend Villa & Food',
        totalAmount: 24000,
        paidBy: 'You',
        participants: [
          { name: 'You', share: 6000, status: 'settled' },
          { name: 'Rohan Sharma', share: 6000, status: 'settled' },
          { name: 'Priya Patel', share: 6000, status: 'pending' },
          { name: 'Ananya Verma', share: 6000, status: 'pending' },
        ],
        owedToYou: '₹12,000',
      },
    },
  },
  {
    id: 'debts',
    name: 'Debt Tracking',
    tagline: 'Peer Lending Ledger',
    title: 'Keep track of money borrowed and lent.',
    description:
      'Track money you owe to colleagues and money friends owe you. Record partial repayments, set due dates, and monitor overdue reminders gracefully.',
    highlights: [
      'Bidirectional tracking: You Owe vs Owed to You',
      'Partial payment recording with timestamped history',
      'Automatic overdue indicators and net balance summary',
    ],
    previewData: {
      owedToMe: 8500,
      iOwe: 2500,
      netBalance: '+₹6,000',
      records: [
        { person: 'Vikram Mehta', type: 'owed_to_me', amount: 8500, status: 'due in 5 days' },
        { person: 'Siddharth Roy', type: 'owe', amount: 2500, status: 'due in 14 days' },
      ],
    },
  },
  {
    id: 'calendar',
    name: 'Calendar View',
    tagline: 'Temporal Overview',
    title: 'Your month mapped out chronologically.',
    description:
      'Visualize scheduled subscription renewals, bill due dates, savings deadlines, and expected income on a single synchronized financial timeline.',
    highlights: [
      'Color-coded markers for bills, subs, and debts',
      'Daily commitment tooltips',
      'Prevents month-end cashflow crunches',
    ],
    previewData: {
      events: [
        { date: 'Sep 25', title: 'Airtel Broadband Due', amount: '₹1,179', type: 'bill' },
        { date: 'Sep 28', title: 'Gym Membership Renewal', amount: '₹2,500', type: 'sub' },
        { date: 'Sep 30', title: 'Expected Monthly Salary', amount: '₹85,000', type: 'income' },
      ],
    },
  },
]

export const LANDING_STEPS = [
  {
    number: '01',
    title: 'Create Your Account',
    description:
      'Register securely in under thirty seconds. Your account initializes with a clean slate: no forced clutter, no pre-seeded demo records, just your private workspace.',
  },
  {
    number: '02',
    title: 'Track Your Financial Activity',
    description:
      'Record daily expenses, establish budget guardrails, configure recurring subscriptions, and set savings targets with intuitive fast-entry forms.',
  },
  {
    number: '03',
    title: 'Gain Actionable Clarity',
    description:
      'Understand spending velocity through interactive charts, export professional PDF statements, and receive intelligent reminders before budget limits are reached.',
  },
]

export const LANDING_SECURITY_POINTS = [
  {
    title: 'HttpOnly Cookie Authentication',
    description:
      'Your login session is securely stored using HttpOnly cookies.',
  },
  {
    title: 'Bcrypt Password Hashing',
    description:
      'User passwords are salted and hashed with bcrypt before reaching database storage. Plaintext passwords are never logged or stored.',
  },
  {
    title: 'User Data Isolation',
    description:
      'Your financial data is accessible only within your own account.',
  },
  {
    title: 'Reliable Data Handling',
    description:
      'Your financial records are stored and managed consistently across the application.',
  },
]
