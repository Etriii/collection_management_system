<script setup lang="ts">
import { computed, ref, watch, onBeforeUnmount } from "vue"
import { XCircle, Eye, User, FileText, CreditCard, Loader2 } from "lucide-vue-next"
import apiService from "@services/apiService.ts"

type TxStatus = "sent" | "paid" | "overdue" | "pending"
type SubmissionStatus = "none" | "pending" | "approved" | "rejected"

interface Transaction {
  id: number | string
  transactionNumber?: string
  status: TxStatus
  amount: string | number

  studentId?: string
  student?: string
  category?: string
  fee_id?: string | number

  dueDate?: string
  paymentDate?: string
  createdAt?: string
  paymentMethod?: string
  received_by?: string

  payment_submission_id?: string | number
  paymentSubmissionStatus?: SubmissionStatus

  screenshot_urls?: string[]
}

interface SubmissionFeeItem {
  id: number
  previous_balance: string
  amount_paid: string
  fee: {
    id: number
    category_id: string
    category_name: string
    total_amount: string
    balance: string
    status: string
    due_date: string
  }
}

interface PaymentSubmissionDetail {
  id: number
  student: {
    id: number
    full_name: string
    program_name: string
    s_set: string
    s_lvl: number
  }
  screenshot_urls: string[]
  reviewed_by: string | null
  fee_items: SubmissionFeeItem[]
  created_at: string
  updated_at: string
  total_amount_paid: string
  reference_number: string
  status: "pending" | "approved" | "rejected"
  reviewed_at: string | null
  remarks: string
  updated_by: number | null
}

interface Props {
  isOpen: boolean
  transaction: Transaction | null
  isLoading?: boolean
  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  closeOnOverlay: true,
})

const emit = defineEmits<{
  (e: "close"): void
}>()

function handleClose() {
  emit("close")
}

function onOverlayClick() {
  if (props.closeOnOverlay) handleClose()
}

function onKeydown(e: KeyboardEvent) {
  if (!props.isOpen) return
  if (e.key === "Escape") handleClose()
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
  },
  { immediate: true }
)

window.addEventListener("keydown", onKeydown)
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown)
  document.body.style.overflow = ""
})

function viewScreenshot(url: string) {
  if (url) window.open(url, "_blank")
}

function formatCurrency(amount: number | string) {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(numAmount)) return "₱0.00"
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(numAmount)
}

function formatDate(dateString?: string) {
  if (!dateString) return "N/A"
  const date = new Date(dateString)
  if (isNaN(date.getTime())) return "Invalid Date"
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

function capitalize(s?: string) {
  if (!s) return ""
  return s.charAt(0).toUpperCase() + s.slice(1)
}

const pillClass = computed(() => {
  const s = props.transaction?.status
  return {
    "px-2 py-1 text-xs font-semibold rounded-full": true,
    "bg-blue-100 text-blue-800": s === "sent",
    "bg-green-100 text-green-800": s === "paid",
    "bg-red-100 text-red-800": s === "overdue",
    "bg-yellow-100 text-yellow-800": s === "pending",
  }
})

const submissionPillClass = computed(() => {
  const s = props.transaction?.paymentSubmissionStatus
  return {
    "px-2 py-1 text-xs font-semibold rounded-full": true,
    "bg-yellow-100 text-yellow-800": s === "pending",
    "bg-green-100 text-green-800": s === "approved",
    "bg-red-100 text-red-800": s === "rejected",
  }
})

const isLoadingSubmission = ref(false)
const submissionError = ref<string | null>(null)
const submissionDetail = ref<PaymentSubmissionDetail | null>(null)

const submission_id = computed(() => {
  const raw = props.transaction?.payment_submission_id
  if (!raw) return null

  const direct = Number(raw)
  if (Number.isFinite(direct) && direct > 0) return direct

  const match = String(raw).match(/\d+/)
  if (match) {
    const n = Number(match[0])
    return n > 0 ? n : null
  }
  return null
})

async function fetchSubmissionDetail(submissionId: number) {
  isLoadingSubmission.value = true
  submissionError.value = null
  submissionDetail.value = null

  try {
    const res = await apiService.get(`/api/v1/payment-submissions/${submissionId}/`)
    const body = (res as any)?.data ?? res
    const detail: PaymentSubmissionDetail = body?.status_code !== undefined && body?.data ? body.data : body
    submissionDetail.value = detail
  } catch (e: any) {
    console.error("Failed to fetch submission detail:", e)
    submissionError.value = e?.response?.data?.detail || e?.message || "Failed to load submission detail"
  } finally {
    isLoadingSubmission.value = false
  }
}

watch(
  () => props.isOpen,
  async (open) => {
    if (!open) return
    const sid = submission_id.value
    if (sid) await fetchSubmissionDetail(sid)
    else submissionDetail.value = null
  }
)

const proofImages = computed(() => {
  const fromDetail = submissionDetail.value?.screenshot_urls ?? []
  if (Array.isArray(fromDetail) && fromDetail.length > 0) return fromDetail
  const fromTx = props.transaction?.screenshot_urls ?? []
  return Array.isArray(fromTx) ? fromTx : []
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="onOverlayClick"
      >
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Transaction Details</h2>
              <div v-if="transaction" class="flex items-center mt-2 space-x-2">
                <span :class="pillClass">
                  {{ capitalize(transaction.status) }}
                </span>

                <span
                  v-if="transaction.paymentSubmissionStatus && transaction.paymentSubmissionStatus !== 'none'"
                  :class="submissionPillClass"
                >
                  {{ capitalize(transaction.paymentSubmissionStatus) }}
                </span>
              </div>
            </div>

            <button @click="handleClose" class="text-gray-400 hover:text-gray-600">
              <XCircle class="h-6 w-6" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6">
            <div v-if="isLoading" class="text-center">
              <Loader2 class="inline-block animate-spin h-8 w-8 text-blue-600 mb-2" />
              <p class="text-gray-600">Loading transaction details...</p>
            </div>

            <div v-else-if="transaction">
              <!-- Transaction Info -->
              <div class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Transaction Information</h3>

                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-gray-600">Transaction No.:</p>
                    <p class="font-semibold font-mono">
                      {{ transaction.transactionNumber || `TX-${transaction.id}` }}
                    </p>
                  </div>

                  <div>
                    <p class="text-gray-600">Amount Paid:</p>
                    <p class="font-semibold text-2xl text-emerald-600">
                      {{ formatCurrency(transaction.amount) }}
                    </p>
                  </div>

                  <div>
                    <p class="text-gray-600">Payment Method:</p>
                    <p class="font-semibold uppercase">{{ transaction.paymentMethod || "N/A" }}</p>
                  </div>

                  <div>
                    <p class="text-gray-600">Payment Date:</p>
                    <p class="font-semibold">
                      {{ formatDate(transaction.paymentDate || transaction.createdAt) }}
                    </p>
                  </div>

                  <div>
                    <p class="text-gray-600">Due Date:</p>
                    <p class="font-semibold">{{ formatDate(transaction.dueDate) }}</p>
                  </div>

                  <div v-if="transaction.received_by">
                    <p class="text-gray-600">Received By:</p>
                    <p class="font-semibold">{{ transaction.received_by }}</p>
                  </div>
                </div>
              </div>

              <!-- Student Info -->
              <div class="bg-white border border-gray-200 rounded-lg p-4 mt-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User class="h-5 w-5 text-gray-700" />
                  Student Information
                </h3>

                <div class="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-gray-600">Student ID:</p>
                    <p class="font-semibold text-lg">{{ transaction.studentId || "N/A" }}</p>
                  </div>
                  <div>
                    <p class="text-gray-600">Student Name:</p>
                    <p class="font-semibold text-lg">{{ transaction.student || "N/A" }}</p>
                  </div>
                  <div>
                    <p class="text-gray-600">Category:</p>
                    <p class="font-semibold">{{ transaction.category || "N/A" }}</p>
                  </div>
                  <div>
                    <p class="text-gray-600">Fee ID:</p>
                    <p class="font-semibold font-mono">{{ transaction.fee_id || "N/A" }}</p>
                  </div>
                </div>
              </div>

              <!-- Payment Submission Details -->
              <div v-if="transaction.payment_submission_id" class="bg-white border border-gray-200 rounded-lg p-4 mt-6">
                <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <CreditCard class="h-5 w-5 text-gray-700" />
                  Payment Submission Details
                </h3>

                <div v-if="isLoadingSubmission" class="flex items-center gap-2 text-gray-600">
                  <Loader2 class="h-5 w-5 animate-spin text-blue-600" />
                  Loading submission details...
                </div>

                <div v-else-if="submissionError" class="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3">
                  {{ submissionError }}
                </div>

                <div v-else-if="submissionDetail" class="space-y-4">
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-gray-600">Submission ID:</p>
                      <p class="font-semibold font-mono">{{ submissionDetail.id }}</p>
                    </div>

                    <div>
                      <p class="text-gray-600">Submission Status:</p>
                      <span
                        class="px-2 py-1 text-xs font-semibold rounded-full"
                        :class="{
                          'bg-yellow-100 text-yellow-800': submissionDetail.status === 'pending',
                          'bg-green-100 text-green-800': submissionDetail.status === 'approved',
                          'bg-red-100 text-red-800': submissionDetail.status === 'rejected',
                        }"
                      >
                        {{ capitalize(submissionDetail.status) }}
                      </span>
                    </div>

                    <div>
                      <p class="text-gray-600">Reference Number:</p>
                      <p class="font-semibold font-mono">{{ submissionDetail.reference_number }}</p>
                    </div>

                    <div>
                      <p class="text-gray-600">Total Amount Paid:</p>
                      <p class="font-semibold text-emerald-600">
                        {{ formatCurrency(submissionDetail.total_amount_paid) }}
                      </p>
                    </div>

                    <div>
                      <p class="text-gray-600">Submitted At:</p>
                      <p class="font-semibold">{{ formatDate(submissionDetail.created_at) }}</p>
                    </div>

                    <div>
                      <p class="text-gray-600">Remarks:</p>
                      <p class="font-semibold">{{ submissionDetail.remarks || "—" }}</p>
                    </div>
                  </div>

                  <div class="border border-gray-200 rounded-lg overflow-hidden mt-6">
                    <div class="bg-gray-50 px-4 py-2 text-sm font-semibold text-gray-700">
                      Fee Items Applied in this Submission
                    </div>

                    <div v-if="submissionDetail.fee_items?.length" class="divide-y divide-gray-200">
                      <div
                        v-for="item in submissionDetail.fee_items"
                        :key="item.id"
                        class="px-4 py-3 grid grid-cols-12 gap-3 text-sm"
                      >
                        <div class="col-span-5">
                          <p class="font-semibold text-gray-900">{{ item.fee.category_name }}</p>
                          <p class="text-xs text-gray-500">
                            Fee ID: <span class="font-mono">{{ item.fee.id }}</span>
                            • Due: {{ formatDate(item.fee.due_date) }}
                          </p>
                        </div>

                        <div class="col-span-3">
                          <p class="text-gray-600">Previous Balance</p>
                          <p class="font-semibold">{{ formatCurrency(item.previous_balance) }}</p>
                        </div>

                        <div class="col-span-2">
                          <p class="text-gray-600">Paid</p>
                          <p class="font-semibold text-emerald-600">{{ formatCurrency(item.amount_paid) }}</p>
                        </div>

                        <div class="col-span-2">
                          <p class="text-gray-600">New Balance</p>
                          <p class="font-semibold">{{ formatCurrency(item.fee.balance) }}</p>
                        </div>
                      </div>
                    </div>

                    <div v-else class="px-4 py-3 text-sm text-gray-500">
                      No fee items found for this submission.
                    </div>
                  </div>
                </div>

                <div v-else class="text-sm text-gray-500">No submission details loaded.</div>
              </div>

              <!-- Proof -->
              <div v-if="proofImages.length > 0" class="mt-6 px-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText class="h-5 w-5 text-gray-700" />
                  Proof of Payment
                </h3>

                <div class="grid grid-cols-3 gap-3">
                  <div
                    v-for="(url, idx) in proofImages"
                    :key="idx"
                    class="relative group cursor-pointer"
                    @click="viewScreenshot(url)"
                  >
                    <img
                      :src="url"
                      :alt="`Screenshot ${idx + 1}`"
                      class="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors"
                    />
                    <div
                      class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center"
                    >
                      <Eye class="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
              <p class="text-sm text-yellow-800">No transaction selected.</p>
            </div>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div class="flex justify-end">
              <button
                @click="handleClose"
                class="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>