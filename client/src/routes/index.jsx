import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AppLayout } from '../components/layout/AppLayout'
import { ProtectedRoute } from '../components/auth/ProtectedRoute'
import Landing from '../pages/Landing'
import Login from '../pages/Login'
import Register from '../pages/Register'
import Dashboard from '../pages/Dashboard'
import Transactions from '../pages/Transactions'
import Budgets from '../pages/Budgets'
import Analytics from '../pages/Analytics'
import Goals from '../pages/Goals'
import Subscriptions from '../pages/Subscriptions'
import RecurringExpenses from '../pages/RecurringExpenses'
import Reports from '../pages/Reports'
import Settings from '../pages/Settings'
import Categories from '../pages/Categories'
import PaymentMethods from '../pages/PaymentMethods'
import SharedExpenses from '../pages/SharedExpenses'
import Debts from '../pages/Debts'
import Calendar from '../pages/Calendar'
import Activity from '../pages/Activity'
import Trash from '../pages/Trash'

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Landing Experience */}
      <Route path="/" element={<Landing />} />

      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected App Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/budgets" element={<Budgets />} />
          <Route path="/recurring-expenses" element={<RecurringExpenses />} />
          <Route path="/subscriptions" element={<Subscriptions />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/shared-expenses" element={<SharedExpenses />} />
          <Route path="/debts" element={<Debts />} />
          <Route path="/calendar" element={<Calendar />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/activity" element={<Activity />} />
          <Route path="/trash" element={<Trash />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/categories" element={<Categories />} />
          <Route path="/payment-methods" element={<PaymentMethods />} />
        </Route>
      </Route>

      {/* Fallback to Public Landing */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRoutes
