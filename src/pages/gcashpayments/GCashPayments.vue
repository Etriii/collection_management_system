<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from "vue"
import { useGcashpaymentsStore } from "@/stores/gcashpayments_store"
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
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-vue-next"
import type { PaymentApproval } from "@/core/types"
import GCashPaymentApprovalModal from "@/components/modals/GCashPaymentApprovalModal.vue"
import GCashPaymentRejectionModal from "@/components/modals/GCashPaymentRejectionModal.vue"
import { gcashpayments_api } from "@/services/api/gcashpayments_api"

const gcashStore = useGcashpaymentsStore()

const isLoadingModal = ref(false)

const listScrollEl = ref<HTMLElement | null>(null)
const infiniteSentinelEl = ref<HTMLElement | null>(null)
let io: IntersectionObserver | null = null

const stats = computed(() => gcashStore.stats)
const displayedPayments = computed(() => gcashStore.displayedPayments ?? [])
const selectedPayment = computed(() => gcashStore.selectedPayment)
const availableFees = computed(() => gcashStore.availableFees ?? [])
const loadedCount = computed(() => displayedPayments.value.length)
const totalCount = computed(() => gcashStore.totalItems ?? gcashStore.gcashPayments.length)
const canLoadMore = computed(() => !!gcashStore.hasMore && !gcashStore.isLoading && !gcashStore.isLoadingMore)

async function loadNextPage() {
  if (!canLoadMore.value) return
  await gcashStore.loadMore()
}

function setupInfiniteObserver() {
  if (!listScrollEl.value || !infiniteSentinelEl.value) return
  if (io) io.disconnect()

  io = new IntersectionObserver(
    async (entries) => {
      const entry = entries[0]
      if (!entry?.isIntersecting) return
      await loadNextPage()
    },
    { root: listScrollEl.value, rootMargin: "250px", threshold: 0.01 }
  )

  io.observe(infiniteSentinelEl.value)
}

onBeforeUnmount(() => {
  if (io) io.disconnect()
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null
const searchQuery = computed({
  get: () => gcashStore.searchQuery,
  set: (value) => {
    if (searchTimeout) clearTimeout(searchTimeout)
    searchTimeout = setTimeout(async () => {
      gcashStore.setSearchQuery(value)
      await nextTick()
      if (listScrollEl.value) listScrollEl.value.scrollTop = 0
      setupInfiniteObserver()
    }, 200)
  },
})

const activeFilter = computed({
  get: () => gcashStore.activeFilter,
  set: async (value) => {
    gcashStore.setActiveFilter(value as any)
    await nextTick()
    if (listScrollEl.value) listScrollEl.value.scrollTop = 0
    setupInfiniteObserver()
  },
})

onMounted(async () => {
  await gcashStore.resetAndRefetch()
  await nextTick()
  setupInfiniteObserver()
})

async function openApproveModal(payment: PaymentApproval) {
  isLoadingModal.value = true
  try {
    const fullSubmission = await gcashpayments_api.getPaymentSubmission(payment.id)
    gcashStore.selectedPayment = {
      ...payment,
      ...(fullSubmission as any)?.data?.id ? (fullSubmission as any).data : fullSubmission,
      screenshot_urls:
        ((fullSubmission as any)?.data?.screenshot_urls ?? (fullSubmission as any)?.screenshot_urls) ||
        payment.screenshot_urls ||
        [],
    }
    gcashStore.isApproveModalOpen = true
  } catch (err) {
    console.error("Error fetching submission details:", err)
    gcashStore.selectedPayment = payment
    gcashStore.isApproveModalOpen = true
  } finally {
    isLoadingModal.value = false
  }
}

async function openRejectModal(payment: PaymentApproval) {
  isLoadingModal.value = true
  try {
    const fullSubmission = await gcashpayments_api.getPaymentSubmission(payment.id)
    gcashStore.selectedPayment = {
      ...payment,
      ...(fullSubmission as any)?.data?.id ? (fullSubmission as any).data : fullSubmission,
      screenshot_urls:
        ((fullSubmission as any)?.data?.screenshot_urls ?? (fullSubmission as any)?.screenshot_urls) ||
        payment.screenshot_urls ||
        [],
    }
    gcashStore.isRejectModalOpen = true
  } catch (err) {
    console.error("Error fetching submission details:", err)
    gcashStore.selectedPayment = payment
    gcashStore.isRejectModalOpen = true
  } finally {
    isLoadingModal.value = false
  }
}

const handleApprove = async (allocations: any[], notes: string) => {
  if (!selectedPayment.value) return alert("No payment selected")
  try {
    isLoadingModal.value = true
    const payments = allocations.map((a) => ({
      fee: a.fee_id!,
      amount_paid: a.amount.toFixed(2),
      payment_method: (selectedPayment.value as any)?.method || "gcash",
      payment_submission: selectedPayment.value!.id,
    }))

    await gcashpayments_api.bulkCreatePayments(payments)
    gcashStore.isApproveModalOpen = false
    gcashStore.selectedPayment = null
    alert("Payment approved and processed successfully!")
    await gcashStore.resetAndRefetch()
  } catch (err: any) {
    console.error("Failed to approve payment:", err)
    alert("Failed to approve payment: " + (err.response?.data?.detail || err.message || "Unknown error"))
  } finally {
    isLoadingModal.value = false
  }
}

const handleReject = async (reason: string) => {
  if (!selectedPayment.value) return alert("No payment selected")
  try {
    isLoadingModal.value = true
    await gcashpayments_api.rejectPayment(selectedPayment.value.id, { remarks: reason })
    gcashStore.isRejectModalOpen = false
    gcashStore.selectedPayment = null
    alert("Payment rejected successfully")
    await gcashStore.resetAndRefetch()
  } catch (err: any) {
    console.error("Failed to reject payment:", err)
    alert("Failed to reject payment: " + (err.message || "Unknown error"))
  } finally {
    isLoadingModal.value = false
  }
}

function handleCloseApprovalModal() {
  gcashStore.isApproveModalOpen = false
  gcashStore.selectedPayment = null
}
function handleCloseRejectionModal() {
  gcashStore.isRejectModalOpen = false
  gcashStore.selectedPayment = null
}

const viewStudentProfile = (payment: PaymentApproval) => {
  const studentId = gcashStore.getStudentId(payment)
  if (!studentId) return alert("Cannot view profile: Student ID missing")
  window.open(`/students/view/${studentId}`, "_blank")
}

const viewScreenshot = (payment: PaymentApproval) => {
  const url = payment.screenshot_urls?.[0] || (payment as any).screenshot
  if (url) window.open(url, "_blank")
}

const getInitials = (name = "") => {
  if (!name) return "?"
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
}

const formatAmount = (amount: string | number) => {
  const num = typeof amount === "string" ? parseFloat(amount) : amount
  if (!num) return "₱0.00"
  return `₱${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

const getPriorityClass = (priority: string) => {
  switch (priority) {
    case "high": return "bg-red-100 text-red-800"
    case "medium": return "bg-yellow-100 text-yellow-800"
    case "low": return "bg-green-100 text-green-800"
    default: return "bg-gray-100 text-gray-800"
  }
}
const formatPriority = (priority: string) => `${priority.charAt(0).toUpperCase() + priority.slice(1)} Priority`

async function toggleViewPayment(p: PaymentApproval) {
  await gcashStore.toggleRow(p.id)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans antialiased">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 leading-tight">GCash Payment Approvals</h1>
        <p class="text-sm text-gray-500 mt-1">Review and manage pending GCash payments</p>
      </header>

      <div v-if="gcashStore.isLoading && displayedPayments.length === 0" class="text-center py-8">
        <Loader2 class="inline-block animate-spin rounded-full h-8 w-8 text-blue-600" />
        <p class="mt-2 text-gray-600">Loading payments...</p>
      </div>

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

        <div class="bg-white rounded-xl shadow p-6">
          <div class="flex items-center justify-between mb-4">
            <div class="text-sm text-gray-600">
              Showing {{ loadedCount }} of {{ totalCount }} payments
              <span v-if="gcashStore.searchQuery || gcashStore.activeFilter !== 'all'">(filtered)</span>
            </div>

            <button
              type="button"
              class="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 text-sm"
              @click="gcashStore.resetAndRefetch"
              :disabled="gcashStore.isLoading || gcashStore.isLoadingMore"
            >
              Refresh
            </button>
          </div>

          <!-- search + filter -->
          <div class="flex flex-col md:flex-row gap-4 mb-6 items-center">
            <div class="flex-1 relative">
              <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                v-model="searchQuery"
                class="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Search by student name, ID, reference number..."
              />
            </div>

            <div class="relative w-full md:w-auto">
              <select
                v-model="activeFilter"
                class="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All ({{ gcashStore.gcashPayments.length }})</option>
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

          <div class="border border-gray-200 rounded-lg overflow-hidden">
            <div ref="listScrollEl" class="overflow-y-auto" style="max-height: 70vh;">
              <div v-if="displayedPayments.length > 0" class="space-y-6 p-4">
                <div v-for="p in displayedPayments" :key="p.id" class="p-6 bg-gray-50 rounded-xl shadow-sm">
                  <div class="flex items-center justify-between mb-4">
                    <div class="flex items-center space-x-4">
                      <div class="p-3 bg-gray-200 rounded-full flex-shrink-0">
                        <span class="text-sm font-bold text-gray-700">{{ getInitials(p.name) }}</span>
                      </div>
                      <div>
                        <h3 class="font-semibold text-gray-900">{{ p.name || "Unknown Student" }}</h3>
                        <p class="text-xs text-gray-500">
                          {{ p.studentId || "N/A" }} | {{ p.daysAgo || 0 }} days ago
                        </p>
                      </div>
                    </div>

                    <div class="text-right flex-shrink-0">
                      <span class="text-xl font-bold">{{ formatAmount(p.amount_paid) }}</span>
                      <span class="ml-2 px-2 py-1 text-xs font-semibold rounded-full" :class="getPriorityClass(p.priority)">
                        {{ formatPriority(p.priority) }}
                      </span>
                    </div>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                    <div>
                      <p class="font-medium text-gray-800">Reference</p>
                      <p>{{ p.reference_number || "N/A" }}</p>
                    </div>
                    <div>
                      <p class="font-medium text-gray-800">Status</p>
                      <p class="font-semibold">{{ p.status }}</p>
                    </div>
                    <div>
                      <p class="font-medium text-gray-800">Submission ID</p>
                      <p>#{{ p.id }}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    class="w-full flex items-center justify-between px-4 py-2 border border-gray-200 rounded-lg bg-white hover:bg-gray-50 transition"
                    @click="toggleViewPayment(p)"
                  >
                    <span class="text-sm font-medium text-gray-800">View Fees</span>
                    <span class="flex items-center gap-2 text-xs text-gray-500">
                      <Loader2 v-if="gcashStore.detailsLoadingById[p.id]" class="h-4 w-4 animate-spin" />
                      <ChevronUp v-else-if="gcashStore.expandedRows[p.id]" class="h-4 w-4" />
                      <ChevronDown v-else class="h-4 w-4" />
                    </span>
                  </button>

                  <div v-if="gcashStore.expandedRows[p.id]" class="mt-3 bg-white border border-gray-200 rounded-lg p-4">
                    <div v-if="gcashStore.detailsLoadingById[p.id]" class="flex items-center gap-2 text-sm text-gray-600">
                      <Loader2 class="h-4 w-4 animate-spin" /> Loading payment details...
                    </div>

                    <template v-else>
                      <div
                        v-if="gcashStore.submissionDetailsById[p.id]?.fee_items?.length"
                        class="space-y-3"
                      >
                        <div
                          v-for="item in gcashStore.submissionDetailsById[p.id]!.fee_items"
                          :key="item.id"
                          class="border border-gray-100 rounded-lg p-3"
                        >
                          <div class="flex items-start justify-between">
                            <div>
                              <div class="font-semibold text-gray-900">
                                {{ item.fee.category_name }} (Fee #{{ item.fee.id }})
                              </div>
                              <div class="text-xs text-gray-500 mt-1">
                                Previous balance: ₱{{ item.previous_balance }} • Current balance: ₱{{ item.fee.balance }}
                              </div>
                              <div class="text-xs text-gray-500">
                                Due: {{ item.fee.due_date ? new Date(item.fee.due_date).toLocaleString() : "N/A" }}
                              </div>
                            </div>
                            <div class="text-right">
                              <div class="text-sm font-bold text-emerald-600">
                                Paid: ₱{{ item.amount_paid }}
                              </div>
                              <div class="text-xs text-gray-500">
                                Status: {{ item.fee.status }}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div v-else class="text-sm text-gray-600">
                        No fee items found for this submission.
                      </div>
                    </template>
                  </div>

                  <div class="flex flex-col sm:flex-row gap-2 pt-4 border-t border-gray-200 mt-4">
                    <button
                      @click="viewScreenshot(p)"
                      class="flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <Image class="h-4 w-4 mr-2" /> View Screenshot
                    </button>

                    <button
                      @click="viewStudentProfile(p)"
                      class="flex-1 inline-flex items-center justify-center px-4 py-2 border rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      <User class="h-4 w-4 mr-2" /> View Student Profile
                    </button>

                    <div v-if="p.status === 'pending'" class="flex-shrink-0 flex gap-2">
                      <button
                        @click="openRejectModal(p)"
                        class="inline-flex items-center justify-center px-4 py-2 border border-red-500 rounded-md text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <XCircle class="h-4 w-4 mr-2" /> Reject
                      </button>
                      <button
                        @click="openApproveModal(p)"
                        class="inline-flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle class="h-4 w-4 mr-2" /> Approve
                      </button>
                    </div>

                    <div v-else class="text-sm italic px-6 my-4 font-bold" :class="p.status === 'approved' ? 'text-green-600' : 'text-red-600'">
                      {{ p.status === "approved" ? "Approved" : "Rejected" }}
                    </div>
                  </div>
                </div>

                <div ref="infiniteSentinelEl" class="h-1"></div>

                <div v-if="gcashStore.isLoadingMore" class="flex items-center justify-center gap-2 py-4 text-gray-600">
                  <Loader2 class="h-5 w-5 animate-spin text-blue-600" />
                  Loading more payments...
                </div>

                <div v-else-if="!gcashStore.hasMore && displayedPayments.length > 0" class="text-center text-xs text-gray-500 py-4">
                  You’ve reached the end.
                </div>
              </div>

              <div v-else class="p-12 text-center bg-gray-50">
                <CreditCard class="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 class="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
              </div>
            </div>
          </div>
        </div>

        <!-- Approve Payment Modal -->
        <GCashPaymentApprovalModal
          :is-open="gcashStore.isApproveModalOpen"
          :payment="selectedPayment"
          :available-fees="availableFees"
          :is-loading="isLoadingModal"
          @close="handleCloseApprovalModal"
          @approve="handleApprove"
        />

        <!-- Reject Payment Modal -->
        <GCashPaymentRejectionModal
          :is-open="gcashStore.isRejectModalOpen"
          :payment="selectedPayment"
          :is-loading="isLoadingModal"
          @close="handleCloseRejectionModal"
          @reject="handleReject"
        />
      </div>
    </div>
  </div>
</template>