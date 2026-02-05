<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useGcashpaymentsStore } from '@stores/gcashpayments_store'
import {
  Search,
  CheckCircle,
  Clock,
  Wallet,
  CreditCard,
  XCircle,
  Loader2,
  Image,
  User,
  AlertCircle
} from 'lucide-vue-next'
import { useRouter } from 'vue-router';
import AuthenticatedLayout from '@/layouts/AuthenticatedLayout.vue';

const gcashStore = useGcashpaymentsStore()

const router = useRouter();

const pageTitle = 'GCash Payments';

const perPage = ref(5)

const approvalNotes = ref('')

const stats = computed(() => gcashStore.stats)
const paginatedPayments = computed(() => gcashStore.paginatedPayments)
const totalPages = computed(() => gcashStore.totalPages)
const currentPage = computed({
  get: () => gcashStore.currentPage,
  set: (value) => gcashStore.handlePageChange(value)
})
const searchQuery = computed({
  get: () => gcashStore.searchQuery,
  set: (value) => {
    gcashStore.searchQuery = value
    debouncedSearch()
  }
})
const activeFilter = computed({
  get: () => gcashStore.activeFilter,
  set: (value) => {
    gcashStore.activeFilter = value
    gcashStore.currentPage = 1
  }
})
const isLoading = computed(() => gcashStore.isLoading)
const filteredPayments = computed(() => gcashStore.filteredPayments)
const gcashPayments = computed(() => gcashStore.gcashPayments)

const isApproveModalOpen = computed({
  get: () => gcashStore.isApproveModalOpen,
  set: (value) => {
    if (!value) {
      approvalNotes.value = ''
    }
    gcashStore.isApproveModalOpen = value
  }
})
const isRejectModalOpen = computed({
  get: () => gcashStore.isRejectModalOpen,
  set: (value) => {
    if (!value) {
      rejectionReason.value = ''
    }
    gcashStore.isRejectModalOpen = value
  }
})
const rejectionReason = computed({
  get: () => gcashStore.rejectionReason,
  set: (value) => { gcashStore.rejectionReason = value }
})
const selectedPayment = computed(() => gcashStore.selectedPayment)

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const debouncedSearch = () => {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    gcashStore.currentPage = 1
  }, 300)
}

onMounted(async () => {
  await nextTick()
  try {
    await gcashStore.fetchGcashPayments()
  } catch (error) {
    console.error('Failed to load payments:', error)
  }
})

watch(activeFilter, () => {
  gcashStore.currentPage = 1
})

const handleApprove = async () => {
  if (selectedPayment.value) {
    try {
      await gcashStore.approveGcashPayment(selectedPayment.value.id, approvalNotes.value)
      approvalNotes.value = ''
    } catch (error) {
      console.error('Failed to approve GCash payment:', error)
    }
  }
}

const handleReject = async () => {
  if (selectedPayment.value && rejectionReason.value) {
    try {
      await gcashStore.rejectGcashPayment(selectedPayment.value.id, rejectionReason.value)
    } catch (error) {
      console.error('Failed to reject GCash payment:', error)
    }
  }
}

const viewStudentProfile = (payment: any) => {
  console.log('View student profile clicked, payment:', payment);

  if (!payment) {
    console.error('Payment is undefined');
    return;
  }

  const studentId = payment?.student || payment?.studentId || payment?.student_id;

  if (studentId) {
    console.log('Found student ID:', studentId);
    router.push(`/students/view/${studentId}`);
  } else {
    console.error('No student ID found in payment. Available keys:', Object.keys(payment));
    console.error('Payment object:', payment);
  }
};

const viewScreenshot = (payment: any) => {
  if (payment.screenshot_urls && payment.screenshot_urls.length > 0) {
    window.open(payment.screenshot_urls[0], '_blank')
  } else if (payment.screenshot) {
    window.open(payment.screenshot, '_blank')
  }
}


const getInitials = (name: string = '') => {
  if (!name) return '?'
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const formatAmount = (amount: string | number) => {
  if (!amount) return '₱0.00'
  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
  return `₱${numAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case 'high': return 'bg-red-100 text-red-800'
    case 'medium': return 'bg-yellow-100 text-yellow-800'
    case 'low': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

const formatPriority = (priority: string) => {
  return priority.charAt(0).toUpperCase() + priority.slice(1) + ' Priority'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans antialiased">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 leading-tight">GCash Payment Approvals</h1>
        <p class="text-sm text-gray-500 mt-1">Review and manage pending GCash payments</p>
      </header>

      <!-- Loading state -->
      <div v-if="isLoading" class="text-center py-8">
        <Loader2 class="inline-block animate-spin rounded-full h-8 w-8 text-blue-600" />
        <p class="mt-2 text-gray-600">Loading payments...</p>
      </div>

      <!-- Content -->
      <div v-else>
        <!-- stats -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between">
            <div>
              <div class="text-3xl font-bold">{{ stats.pendingApprovals }}</div>
              <p class="text-sm text-gray-500">Pending Approvals</p>
            </div>
            <Clock class="h-8 w-8 text-blue-500" />
          </div>

          <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between">
            <div>
              <div class="text-3xl font-bold text-red-600">{{ stats.highPriorityCount }}</div>
              <p class="text-sm text-gray-500">High Priority</p>
            </div>
            <AlertCircle class="h-8 w-8 text-red-500" />
          </div>

          <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between">
            <div>
              <div class="text-3xl font-bold text-gray-800">{{ formatAmount(stats.totalAmount) }}</div>
              <p class="text-sm text-gray-500">Total Amount</p>
            </div>
            <Wallet class="h-8 w-8 text-purple-500" />
          </div>

          <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between">
            <div>
              <div class="text-3xl font-bold text-gray-800">{{ formatAmount(stats.averageAmount) }}</div>
              <p class="text-sm text-gray-500">Average Amount</p>
            </div>
            <CreditCard class="h-8 w-8 text-green-500" />
          </div>
        </div>

        <!-- main -->
        <div class="bg-white rounded-xl shadow p-6">
          <!-- search w/ filter -->
          <div class="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div class="flex-1 relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input v-model="searchQuery"
                class="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by student name, ID, reference number, or fee type..." />
            </div>
            <div class="relative w-full md:w-auto">
              <select v-model="activeFilter"
                class="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                <option value="all">All ({{ gcashPayments.length }})</option>
                <option value="high">High Priority</option>
                <option value="medium">Medium Priority</option>
                <option value="low">Low Priority</option>
              </select>
              <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          <!-- payment list -->
          <div v-if="paginatedPayments.length > 0" class="space-y-6">
            <div v-for="p in paginatedPayments" :key="p.id" class="p-6 bg-gray-50 rounded-xl shadow-sm">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-4">
                  <div class="p-3 bg-gray-200 rounded-full flex-shrink-0">
                    <span class="text-sm font-bold text-gray-700">{{ getInitials(p.name) }}</span>
                  </div>
                  <div>
                    <h3 class="font-semibold text-gray-900">{{ p.name || 'Unknown Student' }}</h3>
                    <p class="text-xs text-gray-500">{{ p.studentId || 'N/A' }} | {{ p.daysAgo || 0 }} days ago</p>
                  </div>
                </div>
                <div class="text-right flex-shrink-0">
                  <span class="text-xl font-bold">{{ formatAmount(p.amount_paid) }}</span>
                  <span class="ml-2 px-2 py-1 text-xs font-semibold rounded-full" :class="getPriorityClass(p.priority)">
                    {{ formatPriority(p.priority) }}
                  </span>
                </div>
              </div>

              <!-- payment details -->
              <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                <div>
                  <p class="font-medium text-gray-800">Fee Type</p>
                  <p>{{ p.feeType || 'Unknown' }}</p>
                </div>
                <div>
                  <p class="font-medium text-gray-800">GCash Reference</p>
                  <p>{{ p.reference_number || 'N/A' }}</p>
                </div>
                <div>
                  <p class="font-medium text-gray-800">Sender</p>
                  <p>{{ p.sender || 'Unknown' }}</p>
                </div>
                <div class="col-span-1 md:col-span-3">
                  <p class="font-medium text-gray-800">Description</p>
                  <p>{{ p.description || 'No description' }}</p>
                </div>
              </div>

              <div v-if="p.notes" class="flex items-center space-x-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg mb-4">
                <AlertCircle class="h-4 w-4 flex-shrink-0" />
                <p class="text-xs font-medium">{{ p.notes }}</p>
              </div>

              <div class="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
                <button @click="viewScreenshot(p)"
                  class="flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                  <Image class="h-4 w-4 mr-2" /> View Screenshot
                </button>

                <!-- Fixed: Use the updated function and pass the entire payment object -->
                <button @click="viewStudentProfile(p)"
                  class="flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                  <User class="h-4 w-4 mr-2" /> View Student Profile
                </button>

                <div class="flex-shrink-0 flex gap-2">
                  <button @click="gcashStore.openRejectModal(p)"
                    class="inline-flex items-center justify-center px-4 py-2 border border-red-500 rounded-md text-red-600 hover:bg-red-50 transition-colors">
                    <XCircle class="h-4 w-4 mr-2" /> Reject
                  </button>
                  <button @click="gcashStore.openApproveModal(p)"
                    class="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors">
                    <CheckCircle class="h-4 w-4 mr-2" /> Approve
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- if empty -->
          <div v-else class="mt-8 p-12 text-center bg-gray-50 rounded-xl">
            <CreditCard class="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 class="text-lg font-medium text-gray-900 mb-2">No pending payments found</h3>
            <!-- <p class="text-gray-600 mb-4">No payments match your current search and filter.</p>
              <button @click="clearFilters"
                class="px-4 py-2 border rounded-md hover:bg-gray-100 transition-colors">
                Clear Filters
              </button> -->
          </div>
        </div>

        <!-- pagination-->
        <div v-if="filteredPayments.length > 0"
          class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
          <div class="text-sm text-gray-600">
            Showing <span class="font-medium">{{ (currentPage - 1) * perPage + 1 }}</span> to <span
              class="font-medium">{{
                Math.min(currentPage * perPage, filteredPayments.length) }}</span>
            of <span class="font-medium">{{ filteredPayments.length }}</span> entries
          </div>
          <div class="flex items-center space-x-2">
            <button @click="gcashStore.handlePageChange(currentPage - 1)" :disabled="currentPage === 1"
              class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            <span class="text-sm font-medium text-gray-700">Page {{ currentPage }} of {{ totalPages }}</span>
            <button @click="gcashStore.handlePageChange(currentPage + 1)" :disabled="currentPage === totalPages"
              class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- approve payment modal -->
    <div v-if="isApproveModalOpen && selectedPayment"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Approve Payment</h2>
          <button @click="isApproveModalOpen = false" class="text-gray-500 hover:text-gray-700">
            <XCircle class="h-6 w-6" />
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-6">Confirm approval of {{ formatAmount(selectedPayment.amount_paid) }}
          payment
          from {{ selectedPayment.name || 'Unknown Student' }}</p>

        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-800">Payment Details</h3>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div class="text-gray-600">Student:</div>
            <div class="font-medium text-gray-900">{{ selectedPayment.name || 'Unknown' }}</div>

            <div class="text-gray-600">Fee Type:</div>
            <div class="font-medium text-gray-900">{{ selectedPayment.feeType || 'Unknown' }}</div>

            <div class="text-gray-600">Amount:</div>
            <div class="font-medium text-green-600">{{ formatAmount(selectedPayment.amount_paid) }}</div>

            <div class="text-gray-600">GCash Ref:</div>
            <div class="font-medium text-gray-900">{{ selectedPayment.reference_number || 'N/A' }}</div>
          </div>

          <div class="pt-4">
            <label for="approvalNotes" class="block mb-2 text-sm font-medium text-gray-700">Add approval notes
              (optional)...</label>
            <textarea id="approvalNotes" v-model="approvalNotes"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3" placeholder="Notes..."></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <button type="button"
            class="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            @click="isApproveModalOpen = false">
            Cancel
          </button>
          <button type="submit"
            class="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            @click="handleApprove">
            Approve Payment
          </button>
        </div>
      </div>
    </div>

    <!-- reject payment modal -->
    <div v-if="isRejectModalOpen && selectedPayment"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Reject Payment</h2>
          <button @click="isRejectModalOpen = false" class="text-gray-500 hover:text-gray-700">
            <XCircle class="h-6 w-6" />
          </button>
        </div>
        <p class="text-gray-600 mb-6">Are you sure you want to reject this payment from {{ selectedPayment.name ||
          'Unknown Student' }}?
          Please provide a reason for rejection.</p>

        <div class="pt-2 mb-4">
          <label for="rejectionReason" class="block sr-only">Enter reason for rejection...</label>
          <textarea id="rejectionReason" v-model="rejectionReason"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows="4" placeholder="Enter reason for rejection..." required></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <button type="button"
            class="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            @click="isRejectModalOpen = false">
            Cancel
          </button>
          <button type="submit" class="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            @click="handleReject">
            Reject Payment
          </button>
        </div>
      </div>
    </div>
  </div>
</template>