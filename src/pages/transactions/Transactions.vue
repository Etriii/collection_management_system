<script setup lang="ts">
import { computed, onMounted, watch, ref, nextTick } from "vue"
import {
  Plus,
  Search,
  CheckCircle,
  Clock,
  Send,
  XCircle,
  CreditCard,
  Eye,
  Loader2,
  AlertCircle,
} from "lucide-vue-next"
import { useTransactionsStore } from "@/stores/transactions_store"
import CreatePaymentModal from "@/components/modals/CreatePaymentModal.vue"
import TransactionDetailsModal from "@/components/modals/ViewTransactionModal.vue"
import TablePagination from "@components/tables/TablePagination.vue"
import PerPageSelector from "@components/tables/PerPageSelector.vue"

const store = useTransactionsStore()

const isInitialized = ref(false)
const hasError = ref(false)

const tableScrollEl = ref<HTMLElement | null>(null)

const displayedTransactions = computed(() => store.displayedTransactions ?? [])

onMounted(async () => {
  try {
    await store.fetchTransactions(1)
    isInitialized.value = true
  } catch (error) {
    console.error("Failed to initialize store:", error)
    hasError.value = true
  }
})

watch(() => store.isCreateTransactionDialogOpen, (isOpen) => {
  if (!isOpen) store.resetForm()
})

watch(
  () => [store.searchQuery, store.activeFilter, store.paymentSubmissionFilter],
  async () => {
    try {
      await store.fetchTransactions(1)

      await nextTick()
      if (tableScrollEl.value) tableScrollEl.value.scrollTop = 0
    } catch (e) {
      console.error("Refetch failed:", e)
    }
  }
)

let studentSearchTimer: ReturnType<typeof setTimeout> | null = null

watch(
  () => store.newTransaction.studentSearch,
  (v) => {
    const term = (v || "").trim()

    if (studentSearchTimer) clearTimeout(studentSearchTimer)

    if (term.length < 2) {
      store.students = []
      return
    }

    studentSearchTimer = setTimeout(() => {
      store.searchStudentsWithFees(term)
    }, 300)
  }
)

const isFeeLoading = ref(false)
watch(
  () => store.selectedStudent,
  async (student) => {
    if (!student) return
    if (isFeeLoading.value) return

    isFeeLoading.value = true
    try {
      store.newTransaction.student_id = student.id
      await store.loadStudentFees(student.id)
    } catch (error) {
      console.error("Error loading fees:", error)
    } finally {
      isFeeLoading.value = false
    }
  }
)

const formatDate = (date: string | number | Date) => {
  if (!date || date === "Invalid Date" || date === "N/A") return "N/A"
  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) return "Invalid Date"
    return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  } catch {
    return "Invalid Date"
  }
}

const isReadyForPayment = computed(() => {
  return (
    !!store.selectedStudent &&
    store.feeDistribution.length > 0 &&
    parseFloat(store.newTransaction.total_amount_paid || "0") > 0
  )
})

function capitalize(value: any) {
  const s = String(value ?? "General")
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const availableFeesCount = computed(() => store.availableFees.length)
const totalSelectedFeesAmount = computed(() =>
  store.feeDistribution.reduce((sum, fee) => sum + fee.original_amount, 0)
)
const totalBalance = computed(() =>
  store.feeDistribution.reduce((sum, fee) => sum + fee.balance, 0)
)
const remainingBalance = computed(() =>
  store.feeDistribution.reduce((sum, fee) => sum + fee.balance, 0)
)

const loadedCount = computed(() => displayedTransactions.value.length)

function formatAmount(val: any) {
  return new Intl.NumberFormat("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(
    Number(val ?? 0)
  )
}

function getFullStudentName(student: any) {
  if (!student) return "Unknown"
  const parts = [
    student.s_fname,
    student.s_mname,
    student.s_lname,
    student.s_suffix && student.s_suffix !== "N/A" ? student.s_suffix : null,
  ].filter(Boolean)
  return parts.join(" ").trim() || "Unknown"
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 leading-tight">Transactions</h1>
        <p class="text-sm text-gray-500 mt-1">View and manage all financial transactions</p>
      </header>

      <div v-if="hasError && !isInitialized" class="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <AlertCircle class="h-5 w-5 text-red-400 mr-3" />
          <div>
            <p class="text-sm font-medium text-red-800">Failed to load transactions</p>
            <p class="text-sm text-red-600">Please refresh the page or try again later.</p>
          </div>
        </div>
      </div>

      <div v-if="store.isLoading && !isInitialized" class="text-center py-8">
        <Loader2 class="inline-block animate-spin rounded-full h-8 w-8 text-blue-600" />
        <p class="mt-2 text-gray-600">Loading transactions...</p>
      </div>

      <div v-else>
        <!-- Stats Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">
          <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between h-full">
            <div>
              <div class="text-3xl font-bold">{{ store.transactionStats.sentCount }}</div>
              <p class="text-sm text-gray-500">Sent Transactions</p>
              <p class="text-xs text-gray-400">Total</p>
            </div>
            <Send class="h-8 w-8 text-blue-500" />
          </div>

          <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between h-full">
            <div>
              <div class="text-3xl font-bold text-green-600">{{ store.transactionStats.paidCount }}</div>
              <p class="text-sm text-gray-500">Paid Transactions</p>
              <p class="text-xs text-gray-400">Total</p>
            </div>
            <CheckCircle class="h-8 w-8 text-green-500" />
          </div>

          <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between h-full">
            <div>
              <div class="text-3xl font-bold text-red-600">{{ store.transactionStats.overdueCount }}</div>
              <p class="text-sm text-gray-500">Overdue</p>
              <p class="text-xs text-gray-400">Total</p>
            </div>
            <XCircle class="h-8 w-8 text-red-500" />
          </div>

        </div>

        <!-- main -->
        <div class="bg-white rounded-xl shadow p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="text-sm text-gray-600">
              Showing {{ loadedCount }} of {{ store.totalItems }} transactions
              <span v-if="store.searchQuery || store.activeFilter !== 'all' || store.paymentSubmissionFilter !== 'all'">
                (filtered)
              </span>
            </div>

            <button
              class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              @click="store.isCreateTransactionDialogOpen = true">
              <Plus class="mr-2 h-4 w-4" />
              Create Payment
            </button>
          </div>

          <!-- search w/ filter -->
          <div class="flex flex-col md:flex-row gap-4 mb-6">
            <div class="flex-1 relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input v-model="store.searchQuery" @input="store.handleSearch"
                class="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by student name, transaction number, or category..." />
            </div>

            <div class="flex gap-4">
              <div class="relative">
                <select v-model="store.activeFilter" @change="store.handleFilterChange"
                  class="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="all">All Status</option>
                  <option value="sent">Sent</option>
                  <option value="paid">Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>

              <div class="relative">
                <select v-model="store.paymentSubmissionFilter" @change="store.handlePaymentSubmissionFilterChange"
                  class="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="all">All Submissions</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
                <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- table -->
          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div ref="tableScrollEl" class="overflow-x-auto overflow-y-auto" style="max-height: 70vh;">
              <table class="min-w-full divide-y divide-gray-200">
                <thead class="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction Number
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student ID
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student Name
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submission Status
                    </th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody class="bg-white divide-y divide-gray-200">
                  <tr v-if="displayedTransactions.length === 0 && !store.isLoading">
                    <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                      <CreditCard class="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p class="mb-2 text-gray-700">No transactions found</p>
                    </td>
                  </tr>

                  <tr v-for="transaction in displayedTransactions" :key="transaction.id">
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {{ transaction.transactionNumber }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {{ transaction.studentId || "N/A" }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {{ transaction.student || "Unknown" }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {{ capitalize(transaction.category) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      ₱{{ formatAmount(transaction.amount) }}
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <div class="flex items-center">
                        <Clock class="mr-1 h-4 w-4 text-gray-400" />
                        {{ formatDate(transaction.paymentDate || transaction.createdAt) }}
                      </div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                        'bg-blue-100 text-blue-800': transaction.status === 'sent',
                        'bg-green-100 text-green-800': transaction.status === 'paid',
                        'bg-red-100 text-red-800': transaction.status === 'overdue',
                        'bg-yellow-100 text-yellow-800': transaction.status === 'pending',
                      }">
                        {{ capitalize(transaction.status) }}
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span v-if="transaction.paymentSubmissionStatus && transaction.paymentSubmissionStatus !== 'none'"
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                          'bg-yellow-100 text-yellow-800': transaction.paymentSubmissionStatus === 'pending',
                          'bg-green-100 text-green-800': transaction.paymentSubmissionStatus === 'approved',
                          'bg-red-100 text-red-800': transaction.paymentSubmissionStatus === 'rejected',
                        }">
                        {{ capitalize(transaction.paymentSubmissionStatus) }}
                      </span>
                      <span v-else
                        class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                        N/A
                      </span>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button @click="store.showDialog(transaction)" class="text-blue-600 hover:text-blue-900 p-1"
                        title="View Details">
                        <Eye class="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="px-6 py-3 border-t bg-white flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div class="flex items-center gap-2">
                <span class="text-xs text-gray-500">Rows per page</span>
                <PerPageSelector v-model="store.perPage" @onChange="store.setPerPage" />
              </div>

              <TablePagination :current-page="store.currentPage" :per-page="store.perPage"
                :total-pages="store.totalPages" :total_items="store.totalItems" :loading="store.isLoading"
                @change="store.setPage" />
            </div>
          </div>

          <div v-if="store.isLoading && displayedTransactions.length === 0" class="text-center py-8">
            <Loader2 class="inline-block animate-spin rounded-full h-8 w-8 text-blue-600" />
            <p class="mt-2 text-gray-600">Loading transactions...</p>
          </div>
        </div>
      </div>
    </div>

    <CreatePaymentModal :isOpen="store.isCreateTransactionDialogOpen" :store="store"
      :getFullStudentName="getFullStudentName" :formatAmount="formatAmount" :formatDate="formatDate"
      :capitalize="capitalize" :availableFeesCount="availableFeesCount"
      :totalSelectedFeesAmount="totalSelectedFeesAmount" :totalBalance="totalBalance"
      :remainingBalance="remainingBalance" :isReadyForPayment="isReadyForPayment"
      @close="store.isCreateTransactionDialogOpen = false" />

    <TransactionDetailsModal :isOpen="store.isViewTransactionDialogOpen" :transaction="store.selectedTransaction"
      :isLoading="false" @close="store.hideDialog" />
  </div>
</template>