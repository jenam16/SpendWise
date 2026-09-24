import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import {
  Wallet,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
  Loader2,
  TrendingUp,
  PieChart,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react'
import { ThemeToggle } from '../components/ui/ThemeToggle'

export function Register() {
  const navigate = useNavigate()
  const { register, isAuthenticated } = useAuth()

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    if (error) setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!formData.name.trim()) {
      setError('Please provide your full name.')
      return
    }

    if (!formData.email.trim()) {
      setError('Please provide a valid email address.')
      return
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long.')
      return
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    try {
      setIsSubmitting(true)
      await register({
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        currency: 'INR', // Default fixed application currency
      })
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F6F7FB] dark:bg-[#070B14] text-[#111827] dark:text-[#F8FAFC] transition-colors duration-200 relative overflow-x-hidden">
      {/* Top-Right Theme Toggle */}
      <div className="fixed top-4 right-4 sm:top-6 sm:right-6 z-50">
        <ThemeToggle />
      </div>

      {/* LEFT SIDE: Branding, Visual, Feature Highlights (Desktop/Tablet) */}
      <div className="hidden lg:flex lg:w-1/2 min-h-screen flex-col justify-between p-10 xl:p-16 border-r border-slate-200/80 dark:border-white/[0.07] bg-white dark:bg-[#0C1322] relative overflow-hidden transition-colors duration-200">
        {/* Subtle decorative glow */}
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Brand Header */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              SpendWise
            </span>
          </Link>
        </div>

        {/* Center Editorial + Visual */}
        <div className="relative z-10 my-auto py-8 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-200/60 dark:border-indigo-500/20 mb-5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Clean, Focused Multi-Tenant Workspace</span>
          </div>

          <h1 className="text-3xl xl:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
            Start getting a clearer view of your finances.
          </h1>
          <p className="text-sm xl:text-base text-slate-600 dark:text-slate-400 mt-3 leading-relaxed">
            Join SpendWise to organize transactions, track real-time budgets, and gain confidence in where your money goes every month.
          </p>

          {/* Abstract Financial Visualization Card */}
          <div className="mt-8 p-5 rounded-2xl bg-slate-50 dark:bg-[#10182C] border border-slate-200/90 dark:border-white/[0.08] shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/70 dark:border-white/[0.06]">
              <div>
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Zero Clutter Onboarding
                </p>
                <p className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                   <span className="text-xs font-normal text-slate-500"></span>
                </p>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                Private Account
              </span>
            </div>

            {/* Quick Benefits Grid */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="p-3 rounded-xl bg-white dark:bg-[#0C1322] border border-slate-200/60 dark:border-white/[0.04]">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Smart Analytics</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Real-time cashflow, category breakdown, and monthly targets.</p>
              </div>
              <div className="p-3 rounded-xl bg-white dark:bg-[#0C1322] border border-slate-200/60 dark:border-white/[0.04]">
                <p className="text-xs font-bold text-slate-900 dark:text-white">Built-in AI Assistant</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Type or speak expenses naturally in English or Hinglish.</p>
              </div>
            </div>
          </div>

          {/* Feature Highlights */}
          <div className="mt-8 space-y-3">
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <TrendingUp className="w-3.5 h-3.5" />
              </div>
              <span><strong>Track expenses & income</strong> with automated category breakdown</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <PieChart className="w-3.5 h-3.5" />
              </div>
              <span><strong>Manage budgets</strong> with proactive warning thresholds</span>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="w-6 h-6 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <span><strong>Understand your spending</strong> with voice & conversational AI input</span>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="relative z-10 pt-4 text-xs text-slate-500 dark:text-slate-500">
          SpendWise — Secure personal finance and cashflow tracker.
        </div>
      </div>

      {/* RIGHT SIDE: Authentication Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-10 lg:p-16 min-h-screen">
        <div className="w-full max-w-md space-y-6">
          {/* Mobile Branding (only shown on small screens where left panel is hidden) */}
          <div className="lg:hidden flex items-center gap-3 mb-4">
            <Link to="/" className="inline-flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-indigo-500/25">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                SpendWise
              </span>
            </Link>
          </div>

          {/* Form Header */}
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              Create your SpendWise account
            </h2>
            <p className="mt-1.5 text-sm text-slate-600 dark:text-slate-400">
              Start getting a clearer view of your finances.
            </p>
          </div>

          {/* Register Card */}
          <div className="bg-white dark:bg-[#10182C] border border-slate-200/90 dark:border-white/[0.08] rounded-2xl p-6 sm:p-8 shadow-sm dark:shadow-2xl space-y-5 transition-colors duration-200">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-700 dark:text-rose-400 flex items-start gap-2.5 text-xs animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600 dark:text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    name="name"
                    required
                    autoComplete="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Alex Morgan"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0C1322] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    required
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0C1322] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    required
                    autoComplete="new-password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="At least 6 characters"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0C1322] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    required
                    autoComplete="new-password"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Repeat password"
                    className="w-full pl-10 pr-11 py-2.5 rounded-xl bg-slate-50/70 dark:bg-[#0C1322] border border-slate-200 dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-3 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Bottom Sign In Redirect */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/[0.06] text-center">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Already have an account?{' '}
                <Link
                  to="/login"
                  className="font-semibold text-indigo-600 dark:text-indigo-400 hover:underline transition-colors ml-0.5"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
