<script setup lang="ts">
import {
  Users,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  Smartphone,
  Inbox
} from "lucide-vue-next"

import { computed, ref } from "vue"
import { useDashboardStore } from "../store/useDashboardStore"
import { useDashboard } from "../composables/useDashboardComposables"
import { formatDateTime } from "@utils/dateFormat"
import BaseSelectInput from "@components/common/BaseSelectInput.vue"
import ViewPaymentModal from "@components/modals/payments/ViewPaymentModal.vue"
import { formatCurrency } from "@utils/formatCurrency"
const dashboardStore = useDashboardStore()
useDashboard(dashboardStore)

const stats = computed(() => dashboardStore.stats)

const academicYears = ["2023-2024", "2024-2025", "2025-2026"]
const semesters = ["1st", "2nd"]

const viewPaymenModal = ref<{ isOpen: boolean, paymentID: number }>({ isOpen: false, paymentID: 0 })
const viewPayment = (paymentID: number) => {
  viewPaymenModal.value.paymentID = paymentID
  viewPaymenModal.value.isOpen = true
}
</script>

<template>
  <ViewPaymentModal v-model:is-open="viewPaymenModal.isOpen" :payment-id="viewPaymenModal.paymentID" />
  <div class="min-h-screen bg-gray-50/50">
    <main class="container mx-auto px-4 py-2">

      <div class="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4">
        <div>
          <h1 class="text-2xl font-bold">Dashboard</h1>
          <p class="text-gray-600 text-sm">
            Welcome back! Here's your collection overview.
          </p>
        </div>

        <div class="flex gap-3 items-center">
          <BaseSelectInput v-model="dashboardStore.academicYear"
            :options="academicYears.map(y => ({ label: y, value: y }))" :loading="dashboardStore.loading" />

          <BaseSelectInput v-model="dashboardStore.semester"
            :options="semesters.map(s => ({ label: s + ' sem' , value: s }))" :loading="dashboardStore.loading" />
        </div>
      </div>


      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">

        <!-- TOTAL STUDENTS -->
        <div class="p-4 bg-white rounded-xl shadow-lg">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">Total Students</p>
            <Users class="h-4 w-4 text-gray-400" />
          </div>
          <div class="mt-2 text-2xl font-bold">
            {{ stats.students_count.toLocaleString() }}
          </div>
        </div>

        <!-- TOTAL COLLECTED -->
        <div class="p-4 bg-white rounded-xl shadow-lg">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">Totals to Collect</p>
            <DollarSign class="h-4 w-4 text-gray-400" />
          </div>
          <div class="mt-2 text-2xl font-bold">
            {{formatCurrency(stats.total_amount)}}
          </div>
        </div>

        <!-- TOTAL BALANCE -->
        <div class="p-4 bg-white rounded-xl shadow-lg">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">Total Balance</p>
            <Clock class="h-4 w-4 text-gray-400" />
          </div>
          <div class="mt-2 text-2xl font-bold">
            {{formatCurrency( stats.total_balance)}}
          </div>
          <p class="text-xs text-gray-500">
            {{ stats.overdue_count }} overdue
          </p>
        </div>

        <div class="p-4 bg-white rounded-xl shadow-lg">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">Collection Rate</p>
            <TrendingUp class="h-4 w-4 text-gray-400" />
          </div>

          <div class="mt-2 text-2xl font-bold">
            {{ stats.collection_rate }}%
          </div>

          <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full transition-all duration-500"
              :style="{ width: stats.collection_rate + '%' }">
            </div>
          </div>
        </div>
      </div>

      <!-- MAIN GRID -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div class="bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col lg:col-span-2">

          <div class="p-4 border-b border-gray-50 flex justify-between items-center">
            <h2 class="flex items-center text-lg font-bold text-gray-800">
              <CreditCard class="mr-2 h-5 w-5 text-blue-600" />
              Recent Transactions
            </h2>
            <span v-if="stats.recent_transactions.length"
              class="text-xs font-medium px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
              Top 5
            </span>
          </div>

          <div class="overflow-y-auto custom-scrollbar" :style="{ maxHeight: '300px' }">
            <div v-if="stats.recent_transactions.length" class="divide-y divide-gray-50 space-y-2">

              <div v-for="(t, index) in stats.recent_transactions.slice(0, 5)" :key="index"
                class="flex items-center justify-between px-4 py-2 hover:bg-gray-50 transition-colors duration-200 cursor-pointer border border-gray-200 "
                v-on:click="viewPayment(t.id)">

                <div class="flex items-center space-x-3">
                  <div :class="[
                    'p-2 rounded-full',
                    'bg-green-100 text-green-600'
                  ]">
                    <CheckCircle class="h-4 w-4" />
                  </div>

                  <div class="min-w-0">
                    <p class="font-semibold text-gray-900 truncate capitalize">
                      {{ t.fee.student.full_name.toLowerCase() }}
                    </p>
                    <p class="text-xs text-gray-500">
                      {{ t.fee.category_name }}
                    </p>
                  </div>
                </div>

                <div class="text-right">
                  <p class="font-bold text-gray-900">
                    {{ formatCurrency(Number(t.amount_paid)) }}
                  </p>

                  <div class="flex items-center space-x-2 justify-end mt-1">
                    <span
                      class="inline-flex items-center px-2 py-0.5 text-[10px] font-medium rounded uppercase tracking-wider"
                      :class="t.payment_method.toLowerCase() === 'gcash' ?
                        'bg-blue-50 text-blue-700 border border-blue-100'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'">
                      <Smartphone v-if="t.payment_method.toLowerCase() === 'gcash'" class="mr-1 h-3 w-3" />
                      {{ t.payment_method }}
                    </span>

                    <span class="text-[11px] text-gray-400 whitespace-nowrap">
                      {{ formatDateTime(t.updated_at) }}
                    </span>
                  </div>
                </div>
              </div>

            </div>

            <div v-else class="flex flex-col items-center justify-center py-12">
              <div class="bg-gray-50 p-3 rounded-full mb-3">
                <Inbox class="h-6 w-6 text-gray-300" />
              </div>
              <p class="text-sm text-gray-400">No recent transactions found.</p>
            </div>
          </div>

          <div class="p-4 border-t border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row gap-2">
            <RouterLink to="/transactions"
              class="flex-1 text-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all shadow-sm">
              View All
            </RouterLink>

            <RouterLink to="/transactions"
              class="flex-1 text-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-all shadow-sm shadow-blue-200">
              + New Payment
            </RouterLink>
          </div>
        </div>

        <!-- CATEGORY COLLECTION RATES (GCASH CARD PRESERVED AREA) -->
        <div class="space-y-6">

          <!-- GCASH APPROVAL CARD (still here for future use) -->
          <div class="bg-white rounded-xl shadow p-4">
            <h2 class="flex items-center text-lg font-semibold mb-2">
              <Smartphone class="mr-2 h-5 w-5" />
              GCash Approvals
            </h2>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <AlertCircle class="h-5 w-5 text-orange-500" />
                <span class="text-2xl font-bold">
                  {{ stats.pending_submissions_count }}
                </span>
              </div>
              <span class="px-2 py-1 text-xs bg-gray-200 rounded">
                Pending
              </span>
            </div>

            <RouterLink to="/gcash-payments"
              class="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-lg">
              Review Payments
            </RouterLink>
          </div>

          <!-- CATEGORY COLLECTION RATES -->
          <div class="bg-white rounded-xl shadow p-4">
            <h2 class="flex items-center text-lg font-semibold mb-4">
              <Calendar class="mr-2 h-5 w-5" />
              Category Collection Rates
            </h2>

            <div class="space-y-3">
              <div v-for="(category, index) in stats.collection_rate_per_categories" :key="index" class="space-y-2">
                <div class="flex items-center justify-between">

                  <div>
                    <p class="font-medium text-sm">
                      {{ category.category_name }}
                    </p>
                    <p class="text-xs text-gray-600">
                      {{ category.overdue_count }} overdue
                    </p>
                  </div>

                  <span class="text-sm font-semibold">
                    {{ category.collection_rate }}%
                  </span>

                </div>

                <div :key="'bar-' + index" class="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div class="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    :style="{ width: category.collection_rate + '%' }">
                  </div>
                </div>

              </div>

            </div>
          </div>

        </div>

      </div>
    </main>
  </div>
</template>