<script setup lang="ts">
import { ref, computed} from "vue" //, type Component 
import {
  Search,
  CheckCircle,
  Clock,
//   LayoutGrid,
  Wallet,
//   Users,
  CreditCard,
  XCircle,
  Image,
  User,
  AlertCircle
} from "lucide-vue-next"

const currentPage = ref(1);
const perPage = ref(5);

const handlePageChange = (page: number) => {
  currentPage.value = page;
}

// model
interface PaymentApproval {
  id: string
  name: string
  studentId: string
  feeType: string
  daysAgo: number
  gcashReference: string
  sender: string
  description: string
  priority: "high" | "medium" | "low"
  amount: number
  notes?: string
}

// example data
const payments = ref<PaymentApproval[]>([
  {
    id: "1",
    name: "Micah Angela E. Floro",
    studentId: "2023-00624",
    daysAgo: 24,
    feeType: "T-Shirt",
    gcashReference: "424242424242",
    sender: "Micah Angela E. Floro",
    description: "IC T-Shirt Payment",
    priority: "high",
    amount: 5500,
  },
  {
    id: "2",
    name: "Thessa Angela E. Floro",
    studentId: "2023-00612",
    daysAgo: 24,
    feeType: "Laboratory Fee",
    gcashReference: "535353535353",
    sender: "Mercedita E. Floro",
    description: "Attendance Fees",
    priority: "medium",
    amount: 1200,
    notes: "Note: Submitted by parent. Please verify amount matches lab fee."
  },
  {
    id: "3",
    name: "Jumeirah Joy Bayotas",
    studentId: "2023-00543",
    daysAgo: 25,
    feeType: "Locker",
    gcashReference: "646464646464",
    sender: "Jumeirah Joy Bayotas",
    description: "Locker lang",
    priority: "low",
    amount: 800,
    notes: "Note: Student paid directly from personal account."
  },
    {
    id: "4",
    name: "Micah Angela E. Floro",
    studentId: "2023-00624",
    daysAgo: 24,
    feeType: "T-Shirt",
    gcashReference: "424242424242",
    sender: "Micah Angela E. Floro",
    description: "IC T-Shirt Payment",
    priority: "high",
    amount: 5500,
  },
  {
    id: "5",
    name: "Thessa Angela E. Floro",
    studentId: "2023-00612",
    daysAgo: 24,
    feeType: "Laboratory Fee",
    gcashReference: "535353535353",
    sender: "Mercedita E. Floro",
    description: "Attendance Fees",
    priority: "medium",
    amount: 1200,
    notes: "Note: Submitted by parent. Please verify amount matches lab fee."
  },
  {
    id: "6",
    name: "Jumeirah Joy Bayotas",
    studentId: "2023-00543",
    daysAgo: 25,
    feeType: "Locker",
    gcashReference: "646464646464",
    sender: "Jumeirah Joy Bayotas",
    description: "Locker lang",
    priority: "low",
    amount: 800,
    notes: "Note: Student paid directly from personal account."
  },
])


const searchQuery = ref("")
const activeFilter = ref<"all" | PaymentApproval['priority']>("all")

const selectedPayment = ref<PaymentApproval | null>(null)
const isApproveModalOpen = ref(false)
const isRejectModalOpen = ref(false)
const rejectionReason = ref("")

const stats = computed(() => {
  const highPriority = payments.value.filter((p) => p.priority === "high")
  const totalAmount = payments.value.reduce((sum, p) => sum + p.amount, 0)
  const averageAmount = payments.value.length > 0 ? totalAmount / payments.value.length : 0
  
  return {
    pendingApprovals: payments.value.length,
    highPriorityCount: highPriority.length,
    totalAmount: totalAmount,
    averageAmount: averageAmount
  }
})

// const filteredPayments = computed(() => {
//   currentPage.value = 1;
//   return payments.value.filter((p) => {
//     const q = searchQuery.value.toLowerCase()
//     const matchesSearch =
//       p.name.toLowerCase().includes(q) ||
//       p.studentId.toLowerCase().includes(q) ||
//       p.gcashReference.toLowerCase().includes(q) ||
//       p.feeType.toLowerCase().includes(q)
    
//     const matchesFilter =
//       activeFilter.value === "all" || p.priority === activeFilter.value
    
//     return matchesSearch && matchesFilter
//   })
// })

const filteredPayments = computed(() => {
    const q = searchQuery.value.toLowerCase();

    return payments.value
        .filter(p =>
            (
                p.name.toLowerCase().includes(q) ||
                p.studentId.toLowerCase().includes(q) ||
                p.gcashReference.toLowerCase().includes(q) ||
                p.feeType.toLowerCase().includes(q) 
            ) &&
            (activeFilter.value === "all" || p.priority === activeFilter.value)
        )
        .sort((a, b) => {
            if (a.priority === "high" && b.priority !== "high") return -1;
            if (a.priority !== "high" && b.priority === "high") return 1;
            return 0;
            
        });      
        
});

const totalPages = computed(() => {
  return Math.ceil(filteredPayments.value.length / perPage.value);
});

const paginatedStudents = computed(() => {
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  return filteredPayments.value.slice(start, end);
});

function openApproveModal(payment: PaymentApproval) {
  selectedPayment.value = payment
  isApproveModalOpen.value = true
}

function openRejectModal(payment: PaymentApproval) {
  selectedPayment.value = payment
  isRejectModalOpen.value = true
}

function handleApprove() {
  if (selectedPayment.value) {
    console.log(`Approved payment with ID: ${selectedPayment.value.id}`)
    payments.value = payments.value.filter((p) => p.id !== selectedPayment.value?.id)
    isApproveModalOpen.value = false
    selectedPayment.value = null
  }
}

function handleReject() {
  if (selectedPayment.value) {
    console.log(`Rejected payment with ID: ${selectedPayment.value.id} with reason: ${rejectionReason.value}`)
    payments.value = payments.value.filter((p) => p.id !== selectedPayment.value?.id)
    isRejectModalOpen.value = false
    selectedPayment.value = null
    rejectionReason.value = ""
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans antialiased">
    <div class="container mx-auto px-4 py-8">
  
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 leading-tight">Payment Approvals</h1>
        <p class="text-sm text-gray-500 mt-1">Review and manage pending GCash payments</p>
      </header>

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
            <div class="text-3xl font-bold text-gray-800">₱{{ stats.totalAmount.toLocaleString() }}</div>
            <p class="text-sm text-gray-500">Total Amount</p>
          </div>
          <Wallet class="h-8 w-8 text-purple-500" />
        </div>
    
        <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between">
          <div>
            <div class="text-3xl font-bold text-gray-800">₱{{ stats.averageAmount.toFixed(2) }}</div>
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
            <input
              v-model="searchQuery"
              class="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by student name, ID, reference number, or fee type..."
            />
          </div>
          <div class="relative w-full md:w-auto">
            <select
              v-model="activeFilter"
              class="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All ({{ payments.length }})</option>
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
        <div v-if="paginatedStudents.length > 0" class="space-y-6">
          <div v-for="p in paginatedStudents" :key="p.id" class="p-6 bg-gray-50 rounded-xl shadow-sm">
          
            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-4">
                <div class="p-3 bg-gray-200 rounded-full flex-shrink-0">
                  <span class="text-sm font-bold text-gray-700">{{ p.name.split(' ').map(n => n[0]).join('') }}</span>
                </div>
                <div>
                  <h3 class="font-semibold text-gray-900">{{ p.name }}</h3>
                  <p class="text-xs text-gray-500">{{ p.studentId }} | {{ p.daysAgo }} days ago</p>
                </div>
              </div>
              <div class="text-right flex-shrink-0">
                <span class="text-xl font-bold">₱{{ p.amount.toLocaleString() }}</span>
                <span
                  class="ml-2 px-2 py-1 text-xs font-semibold rounded-full"
                  :class="{
                    'bg-red-100 text-red-800': p.priority === 'high',
                    'bg-yellow-100 text-yellow-800': p.priority === 'medium',
                    'bg-green-100 text-green-800': p.priority === 'low'
                  }"
                >
                  {{ (p.priority as string).charAt(0).toUpperCase() + (p.priority as string).slice(1) }} Priority
                </span>
              </div>
            </div>

            <!-- payment details -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
              <div>
                <p class="font-medium text-gray-800">Fee Type</p>
                <p>{{ p.feeType }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-800">GCash Reference</p>
                <p>{{ p.gcashReference }}</p>
              </div>
              <div>
                <p class="font-medium text-gray-800">Sender</p>
                <p>{{ p.sender }}</p>
              </div>
              <div class="col-span-1 md:col-span-3">
                <p class="font-medium text-gray-800">Description</p>
                <p>{{ p.description }}</p>
              </div>
            </div>

            <div v-if="p.notes" class="flex items-center space-x-2 p-3 bg-yellow-50 text-yellow-800 rounded-lg mb-4">
              <AlertCircle class="h-4 w-4 flex-shrink-0" />
              <p class="text-xs font-medium">{{ p.notes }}</p>
            </div>

            <div class="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200">
              <button class="flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                <Image class="h-4 w-4 mr-2" /> View Screenshot
              </button>
              <button class="flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors">
                <User class="h-4 w-4 mr-2" /> View Student Profile
              </button>
              <div class="flex-shrink-0 flex gap-2">
                <button
                  class="inline-flex items-center justify-center px-4 py-2 border border-red-500 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                  @click="openRejectModal(p)"
                >
                  <XCircle class="h-4 w-4 mr-2" /> Reject
                </button>
                <button
                  class="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                  @click="openApproveModal(p)"
                >
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
          <p class="text-gray-600 mb-4">No payments match your current search and filter.</p>
          <button
            class="px-4 py-2 border rounded-md hover:bg-gray-100 transition-colors"
            @click="searchQuery = ''; activeFilter = 'all';"
          >
            Clear Filters
          </button>
        </div>
      </div>
      <!-- pagination-->
      <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
          <div class="text-sm text-gray-600">
              Showing <span class="font-medium">{{ (currentPage - 1) * perPage + 1 }}</span> to <span
                  class="font-medium">{{ Math.min(currentPage * perPage, filteredPayments.length) }}</span>
              of <span class="font-medium">{{ filteredPayments.length }}</span> entries
          </div>
          <div class="flex items-center space-x-2">
              <button @click="handlePageChange(currentPage - 1)" :disabled="currentPage === 1"
                  class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  Previous
              </button>
              <span class="text-sm font-medium text-gray-700">Page {{ currentPage }} of {{ totalPages }}</span>
              <button @click="handlePageChange(currentPage + 1)" :disabled="currentPage === totalPages"
                  class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  Next
              </button>
          </div>
      </div>
    </div>
    <!-- approve payment modal -->
    <div v-if="isApproveModalOpen && selectedPayment" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Approve Payment</h2>
          <button @click="isApproveModalOpen = false" class="text-gray-500 hover:text-gray-700">
            <XCircle class="h-6 w-6" />
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-6">Confirm approval of ₱{{ selectedPayment.amount.toLocaleString() }} payment from {{ selectedPayment.name }}</p>

        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-800">Payment Details</h3>
          <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <div class="text-gray-600">Student:</div>
            <div class="font-medium text-gray-900">{{ selectedPayment.name }}</div>

            <div class="text-gray-600">Fee Type:</div>
            <div class="font-medium text-gray-900">{{ selectedPayment.feeType }}</div>

            <div class="text-gray-600">Amount:</div>
            <div class="font-medium text-green-600">₱{{ selectedPayment.amount.toLocaleString() }}</div>

            <div class="text-gray-600">GCash Ref:</div>
            <div class="font-medium text-gray-900">{{ selectedPayment.gcashReference }}</div>
          </div>

          <div class="pt-4">
            <label for="approvalNotes" class="block mb-2 text-sm font-medium text-gray-700">Add approval notes (optional)...</label>
            <textarea
              id="approvalNotes"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows="3"
              placeholder="Notes..."
            ></textarea>
          </div>
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <button
            type="button"
            class="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            @click="isApproveModalOpen = false"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
            @click="handleApprove"
          >
            Approve Payment
          </button>
        </div>
      </div>
    </div>

    <!-- reject payment modal -->
    <div v-if="isRejectModalOpen && selectedPayment" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-2xl font-bold text-gray-800">Reject Payment</h2>
          <button @click="isRejectModalOpen = false" class="text-gray-500 hover:text-gray-700">
            <XCircle class="h-6 w-6" />
          </button>
        </div>
        <p class="text-gray-600 mb-6">Are you sure you want to reject this payment from {{ selectedPayment.name }}? Please provide a reason for rejection.</p>

        <div class="pt-2 mb-4">
          <label for="rejectionReason" class="block sr-only">Enter reason for rejection...</label>
          <textarea
            id="rejectionReason"
            v-model="rejectionReason"
            class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            rows="4"
            placeholder="Enter reason for rejection..."
            required
          ></textarea>
        </div>

        <div class="flex justify-end gap-3 pt-6">
          <button
            type="button"
            class="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
            @click="isRejectModalOpen = false"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-5 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
            @click="handleReject"
          >
            Reject Payment
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
