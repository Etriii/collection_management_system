<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
import { useRouter, useRoute } from "vue-router"

import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Calendar,
  BookOpen,
  CreditCard,
  CheckCircle,
  Clock,
  FileText,
  XCircle,
  TriangleAlert,
  Loader2,
} from "lucide-vue-next"

import type { StudentStatus } from "@core/constants"
import { gcashpayments_api } from "@/services/api/gcashpayments_api"

import GCashPaymentApprovalModal from "@/components/modals/GCashPaymentApprovalModal.vue"
import GCashPaymentRejectionModal from "@/components/modals/GCashPaymentRejectionModal.vue"

interface School {
  id: number
  school_name: string
  school_short_name: string
}

interface Institute {
  id: number
  institute_name: string
  school: School
}

interface Program {
  id: number
  name: string
  status: string
  institute: Institute
}

interface Student {
  id: number
  s_studentID: string
  s_fname: string
  s_mname: string
  s_lname: string
  s_suffix: string
  s_email: string
  s_set: string
  s_lvl: number
  s_status: StudentStatus
  s_image: string
  program: Program | number
}

interface Fee {
  id: number
  category_name: string
  category: {
    id: number
    category_name: string
    collection_fee: string
    description: string
  }
  total_amount: string
  balance: string
  status: "paid" | "partial" | "pending" | "overdue"
  due_date: string
  academic_year: string
  semester: string
  remarks: string
}

interface Payment {
  id: number
  fee: {
    id: number
    student: {
      id: number
      full_name: string
      program_name: string
      s_set: string
      s_lvl: number
    }
    category_id: string
    category_name: string
    total_amount: string
    balance: string
    status: string
  }
  received_by: string
  payment_submission: string
  created_at: string
  updated_at: string
  previous_balance: string
  amount_paid: string | number
  payment_method: string
  updated_by: number
}

interface FeeItemFromSubmission {
  id: number
  fee: {
    id: number
    category_id: string
    category_name: string
    total_amount: string
    balance: string
    status: string
    due_date: string
  }
  previous_balance: string
  amount_paid: string
}

interface PaymentSubmission {
  id: number
  amount_paid: string | number
  total_amount_paid?: string | number
  created_at: string
  method?: string
  reference_number: string
  status: "pending" | "approved" | "rejected"
  screenshot_urls: string[]
  remarks: string

  student?: {
    id: number
    full_name: string
    program_name: string
    s_set: string
    s_lvl: number
  }

  fee_items?: FeeItemFromSubmission[]
}

interface FeesSummary {
  total_amount: string
  total_paid: string
  total_balance: string
  pending_fees: number
  paid_fees: number
  overdue_fees: number
  waived_fees: number
}


interface FeeAllocation {
  id: string
  fee_id: number | null
  amount: number
}

const router = useRouter()
const route = useRoute()

const studentId = computed(() => {
  const id = route.params.id
  return typeof id === "string" ? parseInt(id) : Array.isArray(id) ? parseInt(id[0]) : (id as number)
})

const student = ref<Student | null>(null)
const allFees = ref<Fee[]>([])
const allPayments = ref<Payment[]>([])
const allSubmissions = ref<PaymentSubmission[]>([])
const feesSummary = ref<FeesSummary | null>(null)

const isLoading = ref(false)
const error = ref<string | null>(null)

const activeTab = ref<"fees" | "payments" | "submissions">("payments")
const searchQuery = ref("")
const statusFilter = ref("all")

// modals
const isRejectModalOpen = ref(false)
const isApproveModalOpen = ref(false)
const selectedPayment = ref<PaymentSubmission | null>(null)
const isLoadingModal = ref(false)

const availableFees = computed(() => {
  return allFees.value.filter((fee) => {
    const bal = typeof fee.balance === "string" ? parseFloat(fee.balance) : (fee.balance as any)
    return (bal || 0) > 0
  })
})

const fullName = computed(() => {
  if (!student.value) return ""
  const parts = [
    student.value.s_fname || "",
    student.value.s_mname || "",
    student.value.s_lname || "",
    (student.value.s_suffix && student.value.s_suffix.trim()) || "",
  ].filter((p) => p.length > 0)

  return parts.join(" ").trim() || "Unknown Student"
})

const programName = computed(() => {
  const p = student.value?.program
  if (!p || typeof p === "number") return "No Program Assigned"
  return p.name || "No Program Assigned"
})

const totalFees = computed(() => {
  if (!feesSummary.value) return 0
  const v = feesSummary.value.total_amount
  return typeof v === "string" ? parseFloat(v) || 0 : (v as any) || 0
})

const totalBalance = computed(() => {
  if (!feesSummary.value) return 0
  const v = feesSummary.value.total_balance
  return typeof v === "string" ? parseFloat(v) || 0 : (v as any) || 0
})

const totalPaid = computed(() => {
  if (!feesSummary.value) return 0
  const v = feesSummary.value.total_paid
  return typeof v === "string" ? parseFloat(v) || 0 : (v as any) || 0
})

const pendingSubmissions = computed(() => allSubmissions.value.filter((s) => s.status === "pending").length)

const latestFees = computed(() => {
  return [...allFees.value]
    .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())
    .slice(0, 10)
})

const latestPayments = computed(() => {
  return [...allPayments.value]
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10)
})

const latestSubmissions = computed(() => {
  return [...allSubmissions.value]
    .sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1
      if (a.status !== "pending" && b.status === "pending") return 1
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
    .slice(0, 10)
})

const filteredFees = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return latestFees.value.filter((f) => {
    const categoryName = f.category?.category_name || f.category_name || ""
    const ok =
      categoryName.toLowerCase().includes(q) ||
      f.total_amount.toString().toLowerCase().includes(q) ||
      f.status.toLowerCase().includes(q) ||
      f.due_date.toLowerCase().includes(q) ||
      (f.academic_year || "").toLowerCase().includes(q) ||
      (f.semester || "").toLowerCase().includes(q)

    return ok && (statusFilter.value === "all" || f.status === statusFilter.value)
  })
})

const filteredPayments = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return latestPayments.value.filter((p) => {
    const categoryName = p.fee?.category_name || ""
    const method = p.payment_method || ""
    const receivedBy = p.received_by || ""

    const ok =
      method.toLowerCase().includes(q) ||
      receivedBy.toLowerCase().includes(q) ||
      p.amount_paid.toString().includes(q) ||
      p.created_at.toLowerCase().includes(q) ||
      categoryName.toLowerCase().includes(q) ||
      p.id.toString().includes(q)

    return ok && (statusFilter.value === "all" || statusFilter.value === "completed")
  })
})

const filteredSubmissions = computed(() => {
  const q = searchQuery.value.toLowerCase()
  return latestSubmissions.value.filter((s) => {
    const remarks = s.remarks || ""
    const ok =
      (s.reference_number || "").toLowerCase().includes(q) ||
      s.status.toLowerCase().includes(q) ||
      (s.created_at || "").toLowerCase().includes(q) ||
      remarks.toLowerCase().includes(q) ||
      s.amount_paid.toString().includes(q)

    return ok && (statusFilter.value === "all" || s.status === statusFilter.value)
  })
})

function normalizeSubmissionResponse(resp: any): PaymentSubmission {
  if (resp?.data?.id) return resp.data as PaymentSubmission
  return resp as PaymentSubmission
}

function formatCurrency(amount: number | string) {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount
  if (isNaN(numAmount)) return "₱0.00"
  return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(numAmount)
}

function formatDate(dateString: string) {
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

function getStatusClass(status: string) {
  switch (status) {
    case "paid":
    case "completed":
    case "verified":
    case "approved":
      return "bg-emerald-100 text-emerald-800"
    case "pending":
    case "partial":
      return "bg-amber-100 text-amber-800"
    case "overdue":
    case "rejected":
      return "bg-red-100 text-red-800"
    default:
      return "bg-gray-100 text-gray-800"
  }
}

function getStatusText(status: string) {
  return status.toUpperCase()
}

onMounted(async () => {
  if (studentId.value && !isNaN(studentId.value)) {
    await fetchStudentData()
  } else {
    error.value = "Invalid student ID"
  }
})

async function fetchStudentData() {
  if (!studentId.value) return
  isLoading.value = true
  error.value = null

  try {
    const profilePromise = gcashpayments_api.getStudentProfile(studentId.value)
    const submissionsPromise = gcashpayments_api.getStudentPaymentSubmissions(studentId.value, {
      per_page: 100,
      ordering: "-created_at",
    })
    const paymentsPromise = gcashpayments_api.getStudentPaymentHistory(studentId.value, {
      per_page: 100,
      ordering: "-created_at",
    })

    const [profile, submissions, paymentHistory] = await Promise.all([
      profilePromise,
      submissionsPromise,
      paymentsPromise,
    ])

    student.value = profile.student
    allFees.value = profile.fees || []
    feesSummary.value = profile.summary

    if (student.value?.program && typeof student.value.program === "number") {
      const programData = await gcashpayments_api.getProgram(student.value.program)
      student.value.program = {
        id: programData.id,
        name: programData.name,
        status: programData.status,
        institute: {
          id: programData.institute.id,
          institute_name: programData.institute.institute_name,
          school: {
            id: programData.institute.school.id,
            school_name: programData.institute.school.school_name,
            school_short_name: programData.institute.school.short_name,
          },
        },
      }
    }

    allSubmissions.value = (submissions.results || []).filter((sub: any) => {
      const sid = sub?.student?.id ?? sub?.student
      return Number(sid) === Number(studentId.value)
    })

    allPayments.value = paymentHistory.results || []
  } catch (err: any) {
    error.value = err.message || "Failed to fetch student data"
    console.error("Error fetching student data:", err)
  } finally {
    isLoading.value = false
  }
}

async function openApproveModal(submission: PaymentSubmission) {
  isLoadingModal.value = true
  isApproveModalOpen.value = true

  try {
    const full = await gcashpayments_api.getPaymentSubmission(submission.id)
    const normalized = normalizeSubmissionResponse(full)

    selectedPayment.value = {
      ...submission,
      ...normalized,
      screenshot_urls: normalized.screenshot_urls || submission.screenshot_urls || [],
    }
  } catch (err) {
    console.error("Error fetching submission details:", err)
    selectedPayment.value = submission
  } finally {
    isLoadingModal.value = false
  }
}

async function openRejectModal(submission: PaymentSubmission) {
  isLoadingModal.value = true
  isRejectModalOpen.value = true

  try {
    const full = await gcashpayments_api.getPaymentSubmission(submission.id)
    const normalized = normalizeSubmissionResponse(full)

    selectedPayment.value = {
      ...submission,
      ...normalized,
      screenshot_urls: normalized.screenshot_urls || submission.screenshot_urls || [],
    }
  } catch (err) {
    console.error("Error fetching submission details:", err)
    selectedPayment.value = submission
  } finally {
    isLoadingModal.value = false
  }
}

function handleCloseApprovalModal() {
  isApproveModalOpen.value = false
  selectedPayment.value = null
}

function handleCloseRejectionModal() {
  isRejectModalOpen.value = false
  selectedPayment.value = null
}

async function handleApprove(allocations: Array<{ fee_id: number; amount: number }>, notes: string) {
  if (!selectedPayment.value) {
    alert("No payment selected")
    return
  }

  try {
    isLoadingModal.value = true

    const payments = allocations.map((allocation) => ({
      fee: allocation.fee_id,
      amount_paid: allocation.amount.toFixed(2),
      payment_method: selectedPayment.value?.method || "gcash",
      payment_submission: selectedPayment.value!.id,
    }))

    await gcashpayments_api.bulkCreatePayments(payments)

    await gcashpayments_api.approvePayment(selectedPayment.value.id, {
      remarks: notes || "",
      paymentId: 0 as any,
      feeId: 0 as any,
      amountPaid: 0 as any,
    } as any)

    isApproveModalOpen.value = false
    selectedPayment.value = null

    alert("Payment approved and processed successfully!")
    await fetchStudentData()
  } catch (err: any) {
    console.error("Error approving payments:", err)
    alert("Failed to approve payment: " + (err.response?.data?.detail || err.message || "Unknown error"))
  } finally {
    isLoadingModal.value = false
  }
}

async function handleReject(reason: string) {
  if (!selectedPayment.value) return

  try {
    isLoadingModal.value = true
    await gcashpayments_api.rejectPayment(selectedPayment.value.id, { remarks: reason })

    isRejectModalOpen.value = false
    selectedPayment.value = null
    await fetchStudentData()
  } catch (err: any) {
    console.error("Error rejecting submission:", err)
    alert("Failed to reject payment: " + (err.message || "Unknown error"))
  } finally {
    isLoadingModal.value = false
  }
}


watch(activeTab, () => {
  searchQuery.value = ""
  statusFilter.value = "all"
})

function handleBack() {
  router.push({ name: "gcash-payments" })
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div v-if="isLoading" class="text-center py-12">
        <Loader2 class="inline-block animate-spin rounded-full h-8 w-8 text-blue-600" />
        <p class="mt-2 text-gray-600">Loading student data...</p>
      </div>

      <div v-else-if="error" class="text-center py-12">
        <TriangleAlert class="h-16 w-16 text-red-600 mx-auto mb-4" />
        <p class="text-xl font-semibold text-red-600 mb-2">Error Loading Data</p>
        <p class="text-gray-600 mb-4">{{ error }}</p>
        <div class="flex gap-3 justify-center">
          <button
            @click="fetchStudentData"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
          <button
            @click="handleBack"
            class="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>

      <!-- Student Data -->
      <div v-else-if="student" :key="student.id">
        <!-- Back button -->
        <button
          @click="handleBack"
          class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft class="h-5 w-5 mr-2" />
          Back to GCash Payments
        </button>

        <!-- Student Info Card -->
        <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <div class="flex flex-col md:flex-row gap-8">
            <div class="flex-grow">
              <div class="flex items-start justify-between mb-4">
                <div>
                  <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ fullName }}</h1>
                  <p class="text-lg text-gray-600">{{ student.s_studentID }}</p>
                </div>

                <div class="flex gap-2">
                  <span
                    class="px-4 py-2 inline-flex text-sm leading-5 font-bold rounded-full"
                    :class="{
                      'bg-emerald-100 text-emerald-800': student.s_status === 'enrolled',
                      'bg-red-100 text-red-800': student.s_status === 'dropped',
                      'bg-amber-100 text-amber-800': student.s_status === 'graduated',
                    }"
                  >
                    {{ student.s_status.charAt(0).toUpperCase() + student.s_status.slice(1) }}
                  </span>
                </div>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-4">
                <div class="flex items-center">
                  <Mail class="h-5 w-5 mr-3 text-gray-400" />
                  <span>{{ student.s_email || "No email provided" }}</span>
                </div>
                <div class="flex items-center">
                  <Phone class="h-5 w-5 mr-3 text-gray-400" />
                  <span>Contact info not available</span>
                </div>
                <div class="flex items-center">
                  <BookOpen class="h-5 w-5 mr-3 text-gray-400" />
                  <span>{{ programName }} | {{ (student as any).program?.institute?.institute_name }}</span>
                </div>
                <div class="flex items-center">
                  <Calendar class="h-5 w-5 mr-3 text-gray-400" />
                  <span>Level {{ student.s_lvl }} - Set {{ student.s_set }}</span>
                </div>
                <div class="flex items-center">
                  <MapPin class="h-5 w-5 mr-3 text-gray-400" />
                  <span>{{ (student as any).program?.institute?.school?.school_name || "No school info" }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Financial Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Total Fees</p>
                <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(totalFees) }}</p>
              </div>
              <div class="bg-blue-100 p-3 rounded-full">
                <CreditCard class="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Total Paid</p>
                <p class="text-2xl font-bold text-emerald-600">{{ formatCurrency(totalPaid) }}</p>
              </div>
              <div class="bg-emerald-100 p-3 rounded-full">
                <CheckCircle class="h-6 w-6 text-emerald-600" />
              </div>
            </div>
          </div>

          <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-sm text-gray-600 mb-1">Balance</p>
                <p class="text-2xl font-bold text-red-600">{{ formatCurrency(totalBalance) }}</p>
              </div>
              <div class="bg-red-100 p-3 rounded-full">
                <Clock class="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        <!-- Tabs Container -->
        <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
          <div class="border-b border-gray-200">
            <nav class="flex -mb-px">
              <button
                @click="activeTab = 'fees'"
                :class="[
                  'px-6 py-4 text-sm font-semibold transition-colors',
                  activeTab === 'fees'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300',
                ]"
              >
                Fees & Collections ({{ allFees.length }})
              </button>

              <button
                @click="activeTab = 'payments'"
                :class="[
                  'px-6 py-4 text-sm font-semibold transition-colors',
                  activeTab === 'payments'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300',
                ]"
              >
                Payment History ({{ allPayments.length }})
              </button>

              <button
                @click="activeTab = 'submissions'"
                :class="[
                  'px-6 py-4 text-sm font-semibold transition-colors relative',
                  activeTab === 'submissions'
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300',
                ]"
              >
                Payment Submissions ({{ allSubmissions.length }})
                <span
                  v-if="pendingSubmissions > 0"
                  class="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full"
                >
                  {{ pendingSubmissions }}
                </span>
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          <div class="p-6">
            <!-- Fees Tab -->
            <div v-if="activeTab === 'fees'">
              <div v-if="allFees.length > 0" class="flex items-center justify-between mb-4">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search fees..."
                  class="px-4 py-2 border border-gray-300 rounded-lg w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  v-model="statusFilter"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="partial">Partial</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>

              <div class="overflow-x-auto">
                <table v-if="filteredFees.length > 0" class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Category</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Balance</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Due Date</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Academic Year</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Semester</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="fee in filteredFees" :key="fee.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ fee.id }}</td>
                      <td class="px-6 py-4 text-sm text-gray-600">
                        <div class="font-medium">{{ fee.category?.category_name || fee.category_name }}</div>
                        <div class="text-xs text-gray-500">{{ fee.category?.description || "" }}</div>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-600">{{ formatCurrency(fee.total_amount) }}</td>
                      <td class="px-6 py-4 text-sm text-gray-600">{{ formatCurrency(fee.balance) }}</td>
                      <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(fee.due_date) }}</td>
                      <td class="px-6 py-4 text-sm text-gray-600">{{ fee.academic_year }}</td>
                      <td class="px-6 py-4 text-sm text-gray-600">{{ fee.semester }}</td>
                      <td class="px-6 py-4">
                        <span class="px-3 py-1 text-xs font-bold rounded-full" :class="getStatusClass(fee.status)">
                          {{ getStatusText(fee.status) }}
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div v-else class="text-center py-12">
                  <FileText class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p class="text-xl font-medium text-gray-700 mb-2">No Fees Found</p>
                  <p class="text-sm text-gray-500">
                    {{ allFees.length === 0 ? "This student has no fee records." : "No fees match your search criteria." }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Payments Tab -->
            <div v-if="activeTab === 'payments'">
              <div v-if="allPayments.length > 0" class="flex items-center justify-between mb-4">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search payments..."
                  class="px-4 py-2 border border-gray-300 rounded-lg w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  v-model="statusFilter"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>
              </div>

              <div class="overflow-x-auto">
                <table v-if="filteredPayments.length > 0" class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Method</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Received By</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Applied To</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Previous Balance</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="payment in filteredPayments" :key="payment.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 text-sm text-gray-600">{{ payment.id }}</td>
                      <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(payment.created_at) }}</td>
                      <td class="px-6 py-4 text-sm font-semibold text-emerald-600">{{ formatCurrency(payment.amount_paid) }}</td>
                      <td class="px-6 py-4 text-sm text-gray-600">
                        <span class="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                          {{ payment.payment_method.toUpperCase() }}
                        </span>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-600">{{ payment.received_by || "N/A" }}</td>
                      <td class="px-6 py-4 text-sm text-gray-600">
                        <div class="font-medium">{{ payment.fee?.category_name || "N/A" }}</div>
                        <div class="text-xs text-gray-500">Fee ID: {{ payment.fee?.id }}</div>
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-600">{{ formatCurrency(payment.previous_balance) }}</td>
                    </tr>
                  </tbody>
                </table>

                <div v-else class="text-center py-12">
                  <FileText class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p class="text-xl font-medium text-gray-700 mb-2">No Payment History</p>
                  <p class="text-sm text-gray-500">
                    {{ allPayments.length === 0 ? "Payment records will appear here when payments are made." : "No payments match your search criteria." }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Submissions Tab -->
            <div v-if="activeTab === 'submissions'">
              <div v-if="allSubmissions.length > 0" class="flex items-center justify-between mb-4">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search submissions..."
                  class="px-4 py-2 border border-gray-300 rounded-lg w-1/2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <select
                  v-model="statusFilter"
                  class="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div class="overflow-x-auto">
                <table v-if="filteredSubmissions.length > 0" class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">ID</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Date</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Amount</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Reference</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Status</th>
                      <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    <tr v-for="submission in filteredSubmissions" :key="submission.id" class="hover:bg-gray-50">
                      <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ submission.id }}</td>
                      <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(submission.created_at) }}</td>
                      <td class="px-6 py-4 text-sm font-semibold text-gray-900">
                        {{ formatCurrency(submission.total_amount_paid ?? submission.amount_paid) }}
                      </td>
                      <td class="px-6 py-4 text-sm text-gray-600 font-mono">{{ submission.reference_number }}</td>
                      <td class="px-6 py-4">
                        <span class="px-3 py-1 text-xs font-bold rounded-full" :class="getStatusClass(submission.status)">
                          {{ getStatusText(submission.status) }}
                        </span>
                      </td>
                      <td class="px-6 py-4">
                        <div class="flex items-center gap-2">
                          <button
                            v-if="submission.status === 'pending'"
                            @click="openApproveModal(submission)"
                            class="inline-flex items-center px-3 py-1 text-xs font-medium text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors"
                          >
                            <CheckCircle class="h-3 w-3 mr-1" />
                            Approve
                          </button>
                          <button
                            v-if="submission.status === 'pending'"
                            @click="openRejectModal(submission)"
                            class="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors"
                          >
                            <XCircle class="h-3 w-3 mr-1" />
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div v-else class="text-center py-12">
                  <FileText class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                  <p class="text-xl font-medium text-gray-700 mb-2">No Payment Submissions</p>
                  <p class="text-sm text-gray-500">
                    {{
                      allSubmissions.length === 0
                        ? "Payment submissions will appear here when students upload proof of payment."
                        : "No submissions match your search criteria."
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- No Student Found -->
      <div v-else class="text-center py-12">
        <TriangleAlert class="h-16 w-16 text-yellow-600 mx-auto mb-4" />
        <p class="text-xl font-semibold text-gray-700 mb-2">Student Not Found</p>
        <p class="text-gray-600 mb-4">The student you're looking for doesn't exist or couldn't be loaded.</p>
        <button @click="handleBack" class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
          Back to GCash Payments
        </button>
      </div>
    </div>
  </div>

  <!-- Approve Modal -->
  <GCashPaymentApprovalModal
    :is-open="isApproveModalOpen"
    :payment="selectedPayment"
    :available-fees="availableFees"
    :is-loading="isLoadingModal"
    @close="handleCloseApprovalModal"
    @approve="handleApprove"
  />

  <!-- Reject Modal -->
  <GCashPaymentRejectionModal
    :is-open="isRejectModalOpen"
    :payment="selectedPayment"
    :is-loading="isLoadingModal"
    @close="handleCloseRejectionModal"
    @reject="handleReject"
  />
</template>