<script setup lang="ts">
import {
  Wallet,
  CreditCard,
  CheckCircle,
  TrendingUp
} from "lucide-vue-next"

const dashboard = {
  account_summary: {
    overall_balance: 0,
    total_billed: 0,
    total_paid_confirmed: 0,
    payment_progress_percent: 0
  },
  fees: {
    total_count: 0,
    pending_count: 0,
    paid_count: 0,
    waived_count: 0,
    overdue_count: 0
  },
  submissions: {
    total_count: 0,
    pending_review_count: 0,
    approved_count: 0,
    rejected_count: 0,
    pending_review_amount: 0
  }
}
</script>

<template>
  <div class="p-6 space-y-8">

    <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-4 gap-4">

      <div>
        <h1 class="text-2xl font-semibold text-gray-800">
          Dashboard
        </h1>

        <p class="text-gray-500 text-sm">
          Overview of your payments, fees, and submissions
        </p>
      </div>

      <div class="flex flex-wrap gap-3 items-center">

        <div class="flex flex-col">
          <label class="text-xs text-gray-500 mb-1">
            Academic Year
          </label>

          <select
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            <option>2024 - 2025</option>
            <option>2023 - 2024</option>
            <option>2022 - 2023</option>
          </select>
        </div>

        <div class="flex flex-col">
          <label class="text-xs text-gray-500 mb-1">
            Semester
          </label>

          <select
            class="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none">
            <option>1st Semester</option>
            <option>2nd Semester</option>
            <option>Summer</option>
          </select>
        </div>

      </div>

    </div>

    <section class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">

      <div class="flex items-center justify-between mb-6">
        <h2 class="text-lg font-semibold text-gray-700">
          Account Summary
        </h2>

        <TrendingUp class="w-5 h-5 text-indigo-500" />
      </div>

      <div class="grid gap-6 md:grid-cols-3">

        <div class="flex items-center gap-4">
          <div class="bg-indigo-100 text-indigo-600 p-3 rounded-xl">
            <Wallet class="w-5 h-5" />
          </div>

          <div>
            <p class="text-sm text-gray-500">Overall Balance</p>
            <p class="text-xl font-semibold">
              ₱{{ dashboard.account_summary.overall_balance }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="bg-blue-100 text-blue-600 p-3 rounded-xl">
            <CreditCard class="w-5 h-5" />
          </div>

          <div>
            <p class="text-sm text-gray-500">Total Billed</p>
            <p class="text-xl font-semibold">
              ₱{{ dashboard.account_summary.total_billed }}
            </p>
          </div>
        </div>

        <div class="flex items-center gap-4">
          <div class="bg-green-100 text-green-600 p-3 rounded-xl">
            <CheckCircle class="w-5 h-5" />
          </div>

          <div>
            <p class="text-sm text-gray-500">Total Paid</p>
            <p class="text-xl font-semibold">
              ₱{{ dashboard.account_summary.total_paid_confirmed }}
            </p>
          </div>
        </div>

      </div>

      <div class="mt-6">

        <div class="flex justify-between text-sm mb-2">
          <span class="text-gray-500">
            Payment Progress
          </span>

          <span class="font-semibold text-indigo-600">
            {{ dashboard.account_summary.payment_progress_percent }}%
          </span>
        </div>

        <div class="w-full bg-gray-100 rounded-full h-2">
          <div class="bg-indigo-500 h-2 rounded-full transition-all"
            :style="{ width: dashboard.account_summary.payment_progress_percent + '%' }" />
        </div>

        <p class="text-xs text-gray-500 mt-2">
          Pending Review Amount: ₱{{ dashboard.submissions.pending_review_amount }}
        </p>

      </div>

    </section>

    <div class="grid gap-8 lg:grid-cols-2">

      <section class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">

        <h2 class="text-lg font-semibold text-gray-700 mb-4">
          Fees Overview
        </h2>

        <div class="grid gap-4 grid-cols-2">

          <div class="p-4 bg-gray-50 rounded-xl">
            <p class="text-sm text-gray-500">Total Fees</p>
            <p class="text-lg font-semibold">
              {{ dashboard.fees.total_count }}
            </p>
          </div>

          <div class="p-4 bg-yellow-50 rounded-xl">
            <p class="text-sm text-yellow-600">Pending</p>
            <p class="text-lg font-semibold">
              {{ dashboard.fees.pending_count }}
            </p>
          </div>

          <div class="p-4 bg-green-50 rounded-xl">
            <p class="text-sm text-green-600">Paid</p>
            <p class="text-lg font-semibold">
              {{ dashboard.fees.paid_count }}
            </p>
          </div>

          <div class="p-4 bg-blue-50 rounded-xl">
            <p class="text-sm text-blue-600">Waived</p>
            <p class="text-lg font-semibold">
              {{ dashboard.fees.waived_count }}
            </p>
          </div>

          <div class="p-4 bg-red-50 rounded-xl col-span-2">
            <p class="text-sm text-red-600">Overdue</p>
            <p class="text-lg font-semibold">
              {{ dashboard.fees.overdue_count }}
            </p>
          </div>

        </div>

      </section>

      <section class="bg-white border border-gray-100 rounded-2xl shadow-sm p-6">

        <h2 class="text-lg font-semibold text-gray-700 mb-4">
          Payment Submissions
        </h2>

        <div class="grid gap-4 grid-cols-2">

          <div class="p-4 bg-gray-50 rounded-xl">
            <p class="text-sm text-gray-500">Total</p>
            <p class="text-lg font-semibold">
              {{ dashboard.submissions.total_count }}
            </p>
          </div>

          <div class="p-4 bg-yellow-50 rounded-xl">
            <p class="text-sm text-yellow-600">Pending Review</p>
            <p class="text-lg font-semibold">
              {{ dashboard.submissions.pending_review_count }}
            </p>
          </div>

          <div class="p-4 bg-green-50 rounded-xl">
            <p class="text-sm text-green-600">Approved</p>
            <p class="text-lg font-semibold">
              {{ dashboard.submissions.approved_count }}
            </p>
          </div>

          <div class="p-4 bg-red-50 rounded-xl">
            <p class="text-sm text-red-600">Rejected</p>
            <p class="text-lg font-semibold">
              {{ dashboard.submissions.rejected_count }}
            </p>
          </div>

        </div>

      </section>

    </div>

  </div>
</template>