<script setup lang="ts">
import { computed, onMounted, watch, ref } from "vue"
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
  User,
  PlusCircle,
  MinusCircle,
  X,
  ChevronRight,
  ChevronLeft,
  Info,
  FileText,
} from "lucide-vue-next"
import { useTransactionsStore } from "@/stores/transactions"

// Use the store
const store = useTransactionsStore()

const isInitialized = ref(false)
const hasError = ref(false)

// Initialize the store
onMounted(async () => {
  try {
    await store.initialize()
    isInitialized.value = true
  } catch (error) {
    console.error("Failed to initialize store:", error)
    hasError.value = true
  }
})

// Watch for dialog state changes
watch(() => store.isCreateTransactionDialogOpen, async (isOpen) => {
  if (isOpen) {
    await store.loadAllStudents()
  } else {
    store.resetForm()
  }
})

watch(() => store.newTransaction.studentSearch, (searchTerm) => {
  if (store.searchDebounceTimer) {
    clearTimeout(store.searchDebounceTimer);
  }

  const trimmedTerm = searchTerm?.trim() || '';

  if (trimmedTerm.length >= 2) {
    store.searchDebounceTimer = setTimeout(async () => {
      if (!store.isLoadingStudents) {
        await store.searchStudents(trimmedTerm);
      }
    }, 500);
  } else if (trimmedTerm.length === 0) {
    store.students = [];
  }
});

const isFeeLoading = ref(false);

watch(() => store.selectedStudent, async (student) => {
  if (student && !isFeeLoading.value) {
    isFeeLoading.value = true;
    try {
      console.log("Selected student changed, loading fees for student:", student.id);
      store.newTransaction.student_id = student.id;
      await store.loadStudentFees(student.id);
    } catch (error) {
      console.error("Error loading fees:", error);
    } finally {
      isFeeLoading.value = false;
    }
  } else if (!student) {
    console.log("Student cleared, resetting fee data");
    store.newTransaction.student_id = null;
    store.feeOptions = [];
    store.feeDistribution = [];
    store.availableFees = [];
  }
}, { immediate: true });

// Watch for total amount changes
watch(() => store.newTransaction.total_amount_paid, (totalAmount) => {
  const total = parseFloat(totalAmount) || 0
  store.updateFeeDistribution(total)
})

const formatDate = (date: string | number | Date) => {
  if (!date || date === "Invalid Date" || date === "N/A") {
    return "N/A"
  }

  try {
    const dateObj = new Date(date)
    if (isNaN(dateObj.getTime())) {
      return "Invalid Date"
    }
    return dateObj.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })
  } catch (error) {
    console.error("Error formatting date:", date, error)
    return "Invalid Date"
  }
}

// Add missing computed for better UI
const isReadyForPayment = computed(() => {
  return store.selectedStudent && store.feeDistribution.length > 0 &&
    parseFloat(store.newTransaction.total_amount_paid || "0") > 0
})

// Add a computed for available fees count
const availableFeesCount = computed(() => {
  return store.availableFees.length
})

// Add a computed for total selected fees amount
const totalSelectedFeesAmount = computed(() => {
  return store.feeDistribution.reduce((sum, fee) => sum + fee.original_amount, 0)
})

// Add a computed for total balance
const totalBalance = computed(() => {
  return store.feeDistribution.reduce((sum, fee) => sum + fee.balance, 0)
})

const remainingBalance = computed(() => {
  return store.feeDistribution.reduce((sum, fee) => sum + fee.balance, 0)
})

// Pagination helpers
const pageNumbers = computed(() => {
  const pages = []
  const total = store.totalPages
  const current = store.currentPage

  // Always show first page
  pages.push(1)

  // Show pages around current page
  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
    if (!pages.includes(i)) {
      pages.push(i)
    }
  }

  // Always show last page
  if (total > 1 && !pages.includes(total)) {
    pages.push(total)
  }

  return pages
})


const pageStart = computed(() =>
  store.totalItems === 0
    ? 0
    : (store.currentPage - 1) * store.perPage + 1
)

const pageEnd = computed(() =>
  Math.min(store.currentPage * store.perPage, store.totalItems)
)
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 leading-tight">Transactions</h1>
        <p class="text-sm text-gray-500 mt-1">View and manage all financial transactions</p>
      </header>

      <!-- Error State -->
      <div v-if="hasError && !isInitialized" class="mb-8 p-4 bg-red-50 border border-red-200 rounded-lg">
        <div class="flex items-center">
          <AlertCircle class="h-5 w-5 text-red-400 mr-3" />
          <div>
            <p class="text-sm font-medium text-red-800">Failed to load transactions</p>
            <p class="text-sm text-red-600">Please refresh the page or try again later.</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="store.isLoading && !isInitialized" class="text-center py-8">
        <Loader2 class="inline-block animate-spin rounded-full h-8 w-8 text-blue-600" />
        <p class="mt-2 text-gray-600">Loading transactions...</p>
      </div>


      <div v-else>
        <!-- Stats Cards - Using transactionStats from store (all transactions) -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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

          <div class="p-6 bg-white rounded-xl shadow">
            <div class="flex items-center justify-between mb-2">
              <h3 class="text-sm font-medium text-gray-900">Submission Status</h3>
            </div>
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Pending:</span>
                <span class="text-sm font-medium text-yellow-600">{{ store.transactionStats.pendingSubmissions }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Approved:</span>
                <span class="text-sm font-medium text-green-600">{{ store.transactionStats.approvedSubmissions }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-sm text-gray-600">Rejected:</span>
                <span class="text-sm font-medium text-red-600">{{ store.transactionStats.rejectedSubmissions }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- main -->
        <div class="bg-white rounded-xl shadow p-6">
          <div class="flex items-center justify-between mb-6">
            <div class="text-sm text-gray-600">
              Showing {{ pageStart }}–{{ pageEnd }} of {{ store.totalItems }} transactions
              <span v-if="store.searchQuery || store.activeFilter !== 'all' || store.paymentSubmissionFilter !== 'all'">
                (filtered from {{ store.allTransactions.length }} total)
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

          <!-- Loading state -->
          <div v-if="store.isLoading" class="text-center py-8">
            <Loader2 class="inline-block animate-spin rounded-full h-8 w-8 text-blue-600" />
            <p class="mt-2 text-gray-600">Loading transactions...</p>
          </div>

          <!-- table -->
          <div class="overflow-x-auto" v-else>
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Transaction Number</th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student ID</th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Student Name</th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Category</th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount</th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date</th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status</th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Submission Status</th>
                  <th scope="col"
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">


                <!-- if empty -->
                <tr v-if="store.paginatedTransactions?.length === 0">
                  <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                    <CreditCard class="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p class="mb-2 text-gray-700">No transactions found</p>
                    <p class="text-sm text-gray-500">
                      <span
                        v-if="store.searchQuery || store.activeFilter !== 'all' || store.paymentSubmissionFilter !== 'all'">
                        Try adjusting your search or filters.
                      </span>
                      <span v-else>
                        Create your first payment transaction to get started.
                      </span>
                    </p>
                  </td>
                </tr>
                <!-- Use paginatedTransactions instead of filteredTransactions -->
                <tr v-for="transaction in store.paginatedTransactions" :key="transaction.id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {{ transaction.transactionNumber }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ transaction.studentId }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ transaction.student }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {{ transaction.category.charAt(0).toUpperCase() + transaction.category.slice(1) }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ₱{{ transaction.amount.toLocaleString() }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    <div class="flex items-center">
                      <Clock class="mr-1 h-4 w-4 text-gray-400" />
                      {{ formatDate(transaction.paymentDate) }}
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                      'bg-blue-100 text-blue-800': transaction.status === 'sent',
                      'bg-green-100 text-green-800': transaction.status === 'paid',
                      'bg-red-100 text-red-800': transaction.status === 'overdue'
                    }">
                      {{ transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1) }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span v-if="transaction.paymentSubmissionStatus"
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                        'bg-yellow-100 text-yellow-800': transaction.paymentSubmissionStatus === 'pending',
                        'bg-green-100 text-green-800': transaction.paymentSubmissionStatus === 'approved',
                        'bg-red-100 text-red-800': transaction.paymentSubmissionStatus === 'rejected'
                      }">
                      {{ transaction.paymentSubmissionStatus.charAt(0).toUpperCase() +
                        transaction.paymentSubmissionStatus.slice(1) }}
                    </span>
                    <span v-else
                      class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      N/A
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button @click="store.showDialog(transaction)" class="text-blue-600 hover:text-blue-900 p-1"
                        title="View Details">
                        <Eye class="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>

            <!-- Enhanced Pagination -->
            <div v-if="store.totalPages > 1"
              class="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6 mt-4">
              <div class="flex items-center justify-between mt-4">
                <span class="text-sm text-gray-600">
                  Showing {{ pageStart }}–{{ pageEnd }} of {{ store.totalItems }}
                </span>

                <div class="flex gap-2">
                  <button @click="store.goToPage(store.currentPage - 1)" :disabled="store.currentPage === 1"
                    class="pagination-btn">
                    Prev
                  </button>

                  <span class="px-3 py-2 text-sm">
                    Page {{ store.currentPage }} of {{ store.totalPages }}
                  </span>

                  <button @click="store.goToPage(store.currentPage + 1)"
                    :disabled="store.currentPage >= store.totalPages" class="pagination-btn">
                    Next
                  </button>
                </div>
              </div>
              <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p class="text-sm text-gray-700">
                    Page <span class="font-medium">{{ store.currentPage }}</span> of
                    <span class="font-medium">{{ store.totalPages }}</span>
                    <span class="text-gray-500 ml-2">
                      ({{ pageStart }}–{{ pageEnd }} of {{ store.totalItems }})
                    </span>
                  </p>
                </div>
                <div>
                  <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button @click="store.goToPage(store.currentPage - 1)" :disabled="store.currentPage === 1"
                      class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronLeft class="h-5 w-5" />
                    </button>

                    <button v-for="page in pageNumbers" :key="page"
                      @click="() => store.goToPage && store.goToPage(page)" :class="[
                        'relative inline-flex items-center px-4 py-2 border text-sm font-medium',
                        page === store.currentPage
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      ]">
                      {{ page }}
                    </button>
                    <button @click="store.goToPage(store.currentPage + 1)"
                      :disabled="store.currentPage === store.totalPages"
                      class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                      <ChevronRight class="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Payment Dialog -->
    <div v-if="store.isCreateTransactionDialogOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b px-6 py-4 z-10">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">Create New Payment</h2>
            <button @click="store.isCreateTransactionDialogOpen = false"
              class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="Close">
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div class="p-6">
          <form @submit.prevent="store.handleCreateTransaction" class="space-y-6">
            <!-- Step 1: Student Search -->
            <div>
              <h3 class="text-lg font-medium text-gray-900 mb-4">1. Select Student</h3>

              <!-- Search Input with Button -->
              <div class="mb-4">
                <label class="block text-sm font-medium text-gray-700 mb-2">
                  Search Student
                </label>
                <div class="flex gap-2">
                  <div class="relative flex-1">
                    <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input v-model="store.newTransaction.studentSearch" @keyup.enter="store.triggerStudentSearch"
                      class="pl-10 w-full border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter student ID, name, or email..." autocomplete="off" />
                    <Loader2 v-if="store.isLoadingStudents"
                      class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  </div>
                  <button type="button" @click="store.triggerStudentSearch"
                    :disabled="store.isLoadingStudents || store.newTransaction.studentSearch.length < 2"
                    class="px-4 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                    <Search class="h-4 w-4" />
                    <span class="ml-2 hidden sm:inline">Search</span>
                  </button>
                </div>
                <p class="mt-1 text-xs text-gray-500">Enter at least 2 characters and click Search</p>
              </div>

              <!-- Search Results -->
              <div v-if="!store.selectedStudent && store.newTransaction.studentSearch.length >= 2" class="mb-4">
                <!-- Loading State -->
                <div v-if="store.isLoadingStudents" class="p-4 text-center">
                  <Loader2 class="inline-block animate-spin h-6 w-6 text-blue-600" />
                  <p class="mt-2 text-sm text-gray-600">Searching students...</p>
                </div>

                <!-- Results Found -->
                <div v-else-if="store.students.length > 0" class="space-y-2">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">
                      Found {{ store.students.length }} student{{ store.students.length !== 1 ? 's' : '' }} for "{{
                        store.newTransaction.studentSearch }}"
                    </span>
                    <span class="text-xs text-gray-500">
                      Click to select
                    </span>
                  </div>

                  <!-- Single Student Result -->
                  <div v-if="store.students.length === 1"
                    class="p-4 border border-blue-200 rounded-md bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
                    @click="store.selectStudent(store.students[0])">
                    <div class="flex items-center">
                      <User class="h-6 w-6 text-blue-600 mr-3" />
                      <div class="flex-1">
                        <div class="font-bold text-gray-900">{{ store.students[0].s_studentID }}</div>

                        <div class="text-sm text-gray-700">
                          {{ store.students[0].s_fname }}
                          {{ store.students[0].s_mname }}
                          {{ store.students[0].s_lname }}
                          <span v-if="store.students[0].s_suffix && store.students[0].s_suffix.trim() !== ''">
                            {{ store.students[0].s_suffix }}
                          </span>
                        </div>

                        <div class="text-xs text-gray-500 mt-1">
                          {{ store.students[0].s_email }}
                        </div>
                        <div v-if="store.students[0].program" class="text-xs text-blue-600 font-medium mt-1">
                          {{ store.students[0].program.name }}
                        </div>
                      </div>
                      <button type="button"
                        class="ml-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors">
                        Select
                      </button>
                    </div>
                  </div>

                  <!-- Multiple Students Found -->
                  <div v-else class="space-y-2">
                    <div v-for="student in store.students" :key="student.id"
                      class="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                      @click="store.selectStudent(student)">
                      <div class="flex items-center">
                        <User class="h-5 w-5 text-gray-400 mr-3" />
                        <div class="flex-1">
                          <div class="font-bold">{{ student.s_studentID }}</div>
                          <div class="text-sm text-gray-700">
                            {{ student.s_fname }}
                            {{ student.s_mname }}
                            {{ student.s_lname }}
                            <span v-if="student.s_suffix && student.s_suffix.trim() !== ''">
                              {{ student.s_suffix }}
                            </span>
                          </div>
                          <div class="text-xs text-gray-500 mt-1">
                            {{ student.s_email }}
                          </div>
                          <div v-if="student.program" class="text-xs text-blue-600 font-medium">
                            {{ student.program.name }}
                          </div>
                        </div>
                        <ChevronRight class="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- No Results Found -->
                <div v-else-if="!store.isLoadingStudents"
                  class="p-4 text-center text-gray-500 border border-gray-200 rounded-md">
                  <AlertCircle class="mx-auto h-8 w-8 mb-2" />
                  <p>No students found for "{{ store.newTransaction.studentSearch }}"</p>
                  <p class="text-sm mt-1">Try a different search term</p>
                </div>
              </div>

              <!-- Selected Student -->
              <div v-if="store.selectedStudent" class="p-4 bg-green-50 border border-green-200 rounded-md">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center mb-2">
                      <CheckCircle class="h-5 w-5 text-green-600 mr-2" />
                      <span class="text-sm font-medium text-green-800">Selected Student</span>
                    </div>
                    <div class="text-sm font-bold">{{ store.selectedStudent.s_studentID }}</div>
                    <div class="text-sm text-gray-700">
                      {{ store.selectedStudent.s_fname }} {{ store.selectedStudent.s_mname }} {{
                        store.selectedStudent.s_lname }} {{
                        store.selectedStudent.s_suffix }}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ store.selectedStudent.s_email }}
                    </div>
                    <div v-if="store.selectedStudent.program" class="text-xs text-blue-600 font-medium mt-1">
                      {{ store.selectedStudent.program.name }}
                    </div>
                  </div>
                  <button type="button" @click="store.clearSelectedStudent"
                    class="p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded" title="Change student">
                    <X class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            <!-- Step 2: Fees Selection -->
            <div v-if="store.selectedStudent">
              <h3 class="text-lg font-medium text-gray-900 mb-4">2. Select Fees to Pay</h3>

              <!-- Overall Loading State -->
              <div v-if="store.isLoadingFees" class="text-center py-4">
                <Loader2 class="inline-block animate-spin h-6 w-6 text-blue-600" />
                <p class="mt-2 text-sm text-gray-600">Loading fees...</p>
              </div>

              <!-- Content loaded -->
              <div v-else>
                <!-- Available Fees -->
                <div v-if="store.availableFees.length > 0" class="mb-6">
                  <div class="flex items-center justify-between mb-4">
                    <div>
                      <label class="text-sm font-medium text-gray-700 block">
                        Available Fees ({{ availableFeesCount }})
                      </label>
                      <p class="text-xs text-gray-500 mt-1">
                        Showing only pending, partial, or overdue fees with balance > 0
                      </p>
                    </div>
                    <button v-if="availableFeesCount > 0" type="button" @click="store.addAllFeesToDistribution"
                      class="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors">
                      Add All
                    </button>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div v-for="fee in store.availableFees" :key="fee.value"
                      @click="store.addFeeToDistribution(fee.value)"
                      class="p-4 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all duration-200">
                      <div class="flex items-center justify-between">
                        <div class="flex-1">
                          <div class="font-medium text-gray-900">
                            {{ fee.category }}
                            <span :class="{
                              'ml-2 px-2 py-0.5 text-xs rounded-full': true,
                              'bg-yellow-100 text-yellow-800': fee.status === 'pending',
                              'bg-orange-100 text-orange-800': fee.status === 'partial',
                              'bg-red-100 text-red-800': fee.status === 'overdue',
                              'bg-gray-100 text-gray-800': !fee.status
                            }">
                              {{ (fee.status || 'Unknown').charAt(0).toUpperCase() + (fee.status || 'Unknown').slice(1)
                              }}
                            </span>
                          </div>
                          <div class="text-xs text-gray-500 mt-1">
                            Amount: ₱{{ fee.amount.toFixed(2) }}
                            <span class="ml-2 text-orange-600 font-medium">
                              Balance: ₱{{ fee.balance.toFixed(2) }}
                            </span>
                          </div>
                          <div class="text-xs text-gray-400 mt-1">
                            Student: {{ fee.studentName }}
                            <span class="ml-2">Due: {{ fee.due_date ? formatDate(fee.dueDate) : 'N/A' }}</span>
                          </div>
                        </div>
                        <div class="ml-2">
                          <PlusCircle class="h-5 w-5 text-blue-600" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Loading state -->
                <div v-else-if="store.isLoadingFeeDetails" class="mb-6">
                  <div class="p-6 text-center border border-gray-200 rounded-lg bg-gray-50">
                    <Loader2 class="inline-block animate-spin h-8 w-8 text-blue-600 mb-4" />
                    <p class="text-sm font-medium text-gray-700 mb-2">Loading categories...</p>
                    <p class="text-xs text-gray-500">Fetching category information</p>
                  </div>
                </div>

                <!-- No fees -->
                <div v-else class="mb-6">
                  <div class="p-4 text-center border border-gray-200 rounded-lg bg-gray-50">
                    <Info class="h-6 w-6 text-gray-400 mx-auto mb-2" />
                    <p class="text-sm text-gray-600">No pending fees found for this student.</p>
                    <p class="text-xs text-gray-500 mt-1">
                      Only fees with status "pending", "partial", or "overdue" and balance > 0 are shown.
                    </p>
                  </div>
                </div>

                <!-- Selected Fees Section -->
                <div v-if="store.feeDistribution.length > 0" class="mb-6">
                  <div class="flex items-center justify-between mb-4">
                    <div>
                      <h4 class="text-md font-medium text-gray-900">Selected Fees ({{ store.feeDistribution.length }})
                      </h4>
                      <p class="text-xs text-gray-500 mt-1">
                        Set payment amount for each fee.
                      </p>
                    </div>
                    <div class="flex gap-2">
                      <button type="button" @click="store.autoDistributeEvenly"
                        :disabled="store.distributionStats.inputAmount <= 0"
                        class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Distribute total amount equally across all fees">
                        Distribute Evenly
                      </button>
                      <button type="button" @click="store.autoDistributeProportionally"
                        :disabled="store.distributionStats.inputAmount <= 0"
                        class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Distribute total amount proportionally based on each fee's balance">
                        Distribute by Amount
                      </button>
                      <button type="button" @click="store.clearDistribution"
                        class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
                        Clear All
                      </button>
                    </div>
                  </div>

                  <!-- Progress Summary -->
                  <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-center place-items-center">
                      <div>
                        <div class="text-xs text-gray-500 mb-1">Total Fees</div>
                        <div class="text-lg font-bold text-gray-900">
                          ₱{{ totalSelectedFeesAmount.toFixed(2) }}
                        </div>
                      </div>

                      <div>
                        <div class="text-xs text-gray-500 mb-1">Total Balance</div>
                        <div class="text-lg font-bold text-orange-600">
                          ₱{{ totalBalance.toFixed(2) }}
                        </div>
                      </div>

                      <div>
                        <div class="text-xs text-gray-500 mb-1">Payment Amount</div>
                        <div class="text-lg font-bold text-blue-600">
                          ₱{{ (parseFloat(store.newTransaction.total_amount_paid) || 0).toFixed(2) }}
                        </div>
                      </div>

                      <div>
                        <div class="text-xs text-gray-500 mb-1">Remaining Balance</div>
                        <div class="text-lg font-bold" :class="{
                          'text-green-600': Math.abs(remainingBalance) || 0 < 0.01,
                          'text-orange-600': Math.abs(remainingBalance) || 0 >= 0.01
                        }">
                          ₱{{ remainingBalance.toFixed(2) }}
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Fee List -->
                  <div class="space-y-4">
                    <div v-for="(fee, index) in store.feeDistribution" :key="fee.fee_id"
                      class="p-4 border border-gray-200 rounded-lg bg-white">
                      <div class="flex items-start justify-between">
                        <div class="flex-1">
                          <div class="font-medium text-gray-900 mb-2">
                            {{ fee._category || fee.fee_label.split('(')[0].trim() || 'Fee' }}
                          </div>

                          <div class="space-y-2">
                            <label class="block text-sm font-medium text-gray-700">Amount to Pay</label>
                            <div class="relative">
                              <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                              <input type="number" :value="fee.distributed_amount.toFixed(2)" @input="(e) => {
                                const value = parseFloat(e.target.value);
                                if (!isNaN(value)) {
                                  store.updateDistributedAmount(index, parseFloat(value.toFixed(2)));
                                } else {
                                  store.updateDistributedAmount(index, 0);
                                }
                              }" min="0" :max="fee.original_amount.toFixed(2)" step="0.01" :readonly="store.distributionStats.inputAmount
                                <= 0" :class="[
                                  'pl-8 w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2',
                                  store.distributionStats.inputAmount <= 0
                                    ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed'
                                    : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                                ]" placeholder="0.00" />
                              <div v-if="store.distributionStats.inputAmount <= 0"
                                class="absolute inset-0 bg-gray-50 opacity-50 rounded-md cursor-not-allowed"></div>
                            </div>
                            <div class="text-xs text-gray-500">
                              Original: ₱{{ fee.original_amount.toLocaleString() }} |
                              Balance: ₱{{ fee.balance.toLocaleString() }}
                            </div>
                            <div v-if="store.distributionStats.inputAmount <= 0" class="text-xs text-yellow-600 mt-1">
                              ⓘ Enter a total amount below to enable fee distribution
                            </div>
                          </div>
                        </div>

                        <button type="button" @click="store.removeFeeFromDistribution(index)"
                          class="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full" title="Remove">
                          <MinusCircle class="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 3: Payment Details -->
            <div v-if="store.selectedStudent && store.feeDistribution.length > 0">
              <h3 class="text-lg font-medium text-gray-900 mb-4">3. Payment Details</h3>

              <div class="space-y-4">
                <!-- Total Amount -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount (₱)
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                    <input v-model="store.newTransaction.total_amount_paid" type="number" min="0" step="0.01" @input="(e) => {
                      const value = parseFloat(e.target.value);
                      if (!isNaN(value)) {
                        store.newTransaction.total_amount_paid = value.toFixed(2);
                        const total = parseFloat(value.toFixed(2)) || 0;
                        store.updateFeeDistribution(total);
                      } else {
                        store.newTransaction.total_amount_paid = '';
                        store.updateFeeDistribution(0);
                      }
                    }"
                      class="pl-8 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00" required />
                  </div>
                  <div
                    v-if="totalBalance > 0 && parseFloat(store.newTransaction.total_amount_paid || '0') > totalBalance"
                    class="mt-1 text-xs text-red-600">
                    ⚠️ Payment amount exceeds total balance. Remaining will be considered as overpayment.
                  </div>
                </div>

                <!-- Payment Method -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select v-model="store.newTransaction.payment_method"
                    class="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                    <option value="cash">Cash</option>
                    <option value="gcash">GCash</option>
                    <option value="bank">Bank Transfer</option>
                    <option value="online">Online</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <!-- Summary -->
                <div class="p-4 bg-gray-50 border border-gray-200 rounded-md">
                  <h4 class="font-medium text-gray-900 mb-2">Summary</h4>
                  <div class="space-y-2 text-sm">
                    <div class="flex justify-between">
                      <span class="text-gray-600">Student:</span>
                      <span>{{ store.selectedStudent.s_fname }} {{ store.selectedStudent.s_lname }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Fees:</span>
                      <span>{{ store.feeDistribution.length }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Amount:</span>
                      <span class="font-medium">₱{{ store.newTransaction.total_amount_paid || '0.00' }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Method:</span>
                      <span class="capitalize">{{ store.newTransaction.payment_method }}</span>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end gap-3 pt-4">
                  <button type="button"
                    class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    @click="store.isCreateTransactionDialogOpen = false">
                    Cancel
                  </button>
                  <button type="submit" :disabled="!isReadyForPayment"
                    class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                    Create Payment
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- View Transaction Dialog -->
    <div v-if="store.isViewTransactionDialogOpen && store.selectedTransaction"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div class="flex justify-between items-center mb-6">
          <div>
            <h2 class="text-xl font-bold text-gray-800">Transaction Details</h2>
            <div class="flex items-center mt-2 space-x-2">
              <span :class="{
                'px-2 py-1 text-xs font-semibold rounded-full': true,
                'bg-blue-100 text-blue-800': store.selectedTransaction.status === 'sent',
                'bg-green-100 text-green-800': store.selectedTransaction.status === 'paid',
                'bg-red-100 text-red-800': store.selectedTransaction.status === 'overdue'
              }">
                {{ store.selectedTransaction.status.charAt(0).toUpperCase() + store.selectedTransaction.status.slice(1)
                }}
              </span>
              <span v-if="store.selectedTransaction.paymentSubmissionStatus" :class="{
                'px-2 py-1 text-xs font-semibold rounded-full': true,
                'bg-yellow-100 text-yellow-800': store.selectedTransaction.paymentSubmissionStatus === 'pending',
                'bg-green-100 text-green-800': store.selectedTransaction.paymentSubmissionStatus === 'approved',
                'bg-red-100 text-red-800': store.selectedTransaction.paymentSubmissionStatus === 'rejected'
              }">
                {{ store.selectedTransaction.paymentSubmissionStatus.charAt(0).toUpperCase() +
                  store.selectedTransaction.paymentSubmissionStatus.slice(1) }}
              </span>
            </div>
          </div>
          <button @click="store.hideDialog"
            class="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1">
            <X class="h-5 w-5" />
          </button>
        </div>

        <div class="space-y-6">
          <!-- Transaction Header -->
          <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-bold text-gray-900">{{ store.selectedTransaction.transactionNumber }}</h3>
                <p class="text-sm text-gray-600 mt-1">Transaction ID: {{ store.selectedTransaction.id }}</p>
              </div>
              <div class="text-right">
                <div class="text-2xl font-bold text-gray-900">₱{{ store.selectedTransaction.amount.toFixed(2) }}</div>
                <p class="text-sm text-gray-500">Amount Paid</p>
              </div>
            </div>
          </div>

          <!-- Student Information -->
          <div>
            <h4 class="font-medium text-gray-900 mb-3 flex items-center">
              <User class="h-4 w-4 mr-2" />
              Student Information
            </h4>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-medium text-gray-500">Student ID</label>
                  <p class="text-sm text-gray-900 font-medium">{{ store.selectedTransaction.studentId || 'N/A' }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500">Student Name</label>
                  <p class="text-sm text-gray-900 font-medium">{{ store.selectedTransaction.student || 'N/A' }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500">Category</label>
                  <p class="text-sm text-gray-900">{{ store.selectedTransaction.category }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500">Fee ID</label>
                  <p class="text-sm text-gray-900">{{ store.selectedTransaction.fee_id || 'N/A' }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Transaction Details -->
          <div>
            <h4 class="font-medium text-gray-900 mb-3 flex items-center">
              <FileText class="h-4 w-4 mr-2" />
              Transaction Details
            </h4>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-medium text-gray-500">Due Date</label>
                  <p class="text-sm text-gray-900">{{ formatDate(store.selectedTransaction.dueDate) }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500">Created Date</label>
                  <p class="text-sm text-gray-900">{{ store.selectedTransaction.createdAt ?
                    formatDate(store.selectedTransaction.createdAt) : 'N/A' }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500">Payment Method</label>
                  <p class="text-sm text-gray-900 capitalize">{{ store.selectedTransaction.paymentMethod || 'N/A' }}
                  </p>
                </div>
                <div v-if="store.selectedTransaction.received_by">
                  <label class="text-xs font-medium text-gray-500">Received By</label>
                  <p class="text-sm text-gray-900">{{ store.selectedTransaction.received_by }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Payment Submission Details -->
          <div v-if="store.selectedTransaction.payment_submission_id">
            <h4 class="font-medium text-gray-900 mb-3 flex items-center">
              <CreditCard class="h-4 w-4 mr-2" />
              Payment Submission
            </h4>
            <div class="bg-gray-50 p-4 rounded-lg">
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label class="text-xs font-medium text-gray-500">Submission ID</label>
                  <p class="text-sm text-gray-900">{{ store.selectedTransaction.payment_submission_id }}</p>
                </div>
                <div>
                  <label class="text-xs font-medium text-gray-500">Submission Status</label>
                  <span :class="{
                    'px-2 py-1 text-xs font-semibold rounded-full': true,
                    'bg-yellow-100 text-yellow-800': store.selectedTransaction.paymentSubmissionStatus === 'pending',
                    'bg-green-100 text-green-800': store.selectedTransaction.paymentSubmissionStatus === 'approved',
                    'bg-red-100 text-red-800': store.selectedTransaction.paymentSubmissionStatus === 'rejected'
                  }">
                    {{ store.selectedTransaction.paymentSubmissionStatus?.charAt(0).toUpperCase() +
                      store.selectedTransaction.paymentSubmissionStatus?.slice(1) || 'N/A' }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Close Button -->
          <div class="pt-4 border-t border-gray-200">
            <div class="flex justify-end">
              <button @click="store.hideDialog"
                class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>