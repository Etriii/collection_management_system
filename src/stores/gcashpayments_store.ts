import { defineStore } from "pinia"
import { ref, computed } from "vue"
import type { Ref } from "vue"
import type { PaymentApproval, StudentFee } from "@/core/types"
import { gcashpayments_api } from "@/services/api/gcashpayments_api"

type Priority = "high" | "medium" | "low"
type Filter = "all" | Priority

type SubmissionFeeItem = {
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
    due_date: string | null
  }
}

type PaymentSubmissionDetail = {
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
  remarks: string | null
  updated_by: number | null
}

export const useGcashpaymentsStore = defineStore("gcashpayments", () => {

  const gcashPayments: Ref<PaymentApproval[]> = ref([])
  const displayedPayments: Ref<PaymentApproval[]> = ref([])

  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const currentPage = ref(1)
  const perPage = ref(10)
  const totalPages = ref(1)
  const totalItems = ref(0)

  const searchQuery = ref("")
  const activeFilter = ref<Filter>("all")

  const selectedPayment = ref<PaymentApproval | null>(null)
  const isApproveModalOpen = ref(false)
  const isRejectModalOpen = ref(false)

  const availableFees = ref<StudentFee[]>([])

  const expandedRows = ref<Record<number, boolean>>({})
  const submissionDetailsById = ref<Record<number, PaymentSubmissionDetail | null>>({})
  const detailsLoadingById = ref<Record<number, boolean>>({})

  function calculateDaysAgo(dateString: string): number {
    const created = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  function determinePriority(amountPaidStr: string, createdAt: string): Priority {
    const amount = parseFloat(amountPaidStr || "0")
    const daysAgo = calculateDaysAgo(createdAt)

    if (amount > 5000 || daysAgo > 7) return "high"
    if (amount > 1000 || daysAgo > 3) return "medium"
    return "low"
  }

  function unwrapPaged<T = any>(apiRes: any) {
    const body =
      apiRes?.data && apiRes?.success === undefined
        ? apiRes.data
        : apiRes

    const pageObj = body?.data ?? body

    const rows: T[] =
      Array.isArray(pageObj?.data) ? pageObj.data :
      Array.isArray(body?.results) ? body.results :
      Array.isArray(body?.data) ? body.data :
      []

    const current_page = pageObj?.current_page ?? pageObj?.page ?? 1
    const per_page = pageObj?.per_page ?? perPage.value
    const total_items = pageObj?.total_items ?? body?.count ?? rows.length
    const total_pages =
      pageObj?.total_pages ?? (per_page ? Math.ceil((total_items || 0) / per_page) : 1)

    return { rows, current_page, per_page, total_items, total_pages }
  }

  function mapToPaymentApproval(row: any): PaymentApproval {

    const student = row?.student ?? {}
    const created_at = row?.created_at ?? row?.createdAt ?? new Date().toISOString()

    const amount_paid = row?.total_amount_paid ?? row?.amount_paid ?? "0"
    const priority = determinePriority(String(amount_paid), String(created_at))
    const daysAgo = calculateDaysAgo(String(created_at))

    return {
      ...(row as any),
      id: Number(row?.id),
      name: student?.full_name ?? row?.name ?? "Unknown Student",
      studentId: student?.id ? `ID-${student.id}` : row?.studentId ?? "N/A",
      amount_paid: amount_paid,
      reference_number: row?.reference_number ?? row?.referenceNumber ?? "",
      screenshot_urls: row?.screenshot_urls ?? row?.screenshots ?? [],
      status: row?.status ?? "pending",
      priority,
      daysAgo,
      student,
    } as PaymentApproval
  }

  function applyClientFilters(all: PaymentApproval[]) {
    const q = (searchQuery.value || "").trim().toLowerCase()

    const filtered = all.filter((p) => {
      const matchesSearch =
        !q ||
        (p.name || "").toLowerCase().includes(q) ||
        (p.studentId || "").toLowerCase().includes(q) ||
        (p.reference_number || "").toLowerCase().includes(q)

      const matchesFilter = activeFilter.value === "all" || p.priority === activeFilter.value
      return matchesSearch && matchesFilter
    })

    filtered.sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1
      if (a.status !== "pending" && b.status === "pending") return 1
      return (a.daysAgo || 0) - (b.daysAgo || 0)
    })

    displayedPayments.value = filtered
  }

  const stats = computed(() => {
    const totalAmount = gcashPayments.value.reduce(
      (sum, p) => sum + parseFloat((p as any).amount_paid || "0"),
      0,
    )
    const highPriorityCount = gcashPayments.value.filter((p) => (p as any).priority === "high").length
    return {
      pendingApprovals: gcashPayments.value.length,
      highPriorityCount,
      totalAmount,
      averageAmount: gcashPayments.value.length > 0 ? totalAmount / gcashPayments.value.length : 0,
    }
  })

  async function fetchPaymentSubmissions(page = 1) {
    isLoading.value = true
    error.value = null

    try {
      const params = {
        page,
        per_page: perPage.value,
        ordering: "-created_at",
      }

      const apiRes = await gcashpayments_api.getPaymentSubmissions(params as any)

      const { rows, current_page, per_page, total_items, total_pages } = unwrapPaged<any>(apiRes)

      currentPage.value = current_page
      perPage.value = per_page
      totalItems.value = total_items
      totalPages.value = total_pages

      const mapped = rows.map(mapToPaymentApproval)

      gcashPayments.value = mapped
      applyClientFilters(mapped)
    } catch (e: any) {
      console.error("fetchPaymentSubmissions error:", e)
      error.value = e?.message || "Failed to fetch payment submissions"

      gcashPayments.value = []
      displayedPayments.value = []
      currentPage.value = 1
      totalItems.value = 0
      totalPages.value = 1
    } finally {
      isLoading.value = false
    }
  }

  async function resetAndRefetch() {
    expandedRows.value = {}
    submissionDetailsById.value = {}
    detailsLoadingById.value = {}
    await fetchPaymentSubmissions(1)
  }

  async function setPage(page: number) {
    await fetchPaymentSubmissions(page)
  }

  async function setPerPage(pp: number) {
    perPage.value = pp
    await fetchPaymentSubmissions(1)
  }

  function setSearchQuery(v: string) {
    searchQuery.value = v
    applyClientFilters(gcashPayments.value)
  }

  function setActiveFilter(v: Filter) {
    activeFilter.value = v
    applyClientFilters(gcashPayments.value)
  }

  async function fetchSubmissionDetails(id: number) {
    if (submissionDetailsById.value[id]) return submissionDetailsById.value[id]

    detailsLoadingById.value[id] = true
    try {
      const res = await gcashpayments_api.getPaymentSubmission(id)

      const detail: PaymentSubmissionDetail = (res as any)?.data?.id ? (res as any).data : (res as any)
      submissionDetailsById.value[id] = detail
      return detail
    } catch (e) {
      console.error("fetchSubmissionDetails error:", e)
      submissionDetailsById.value[id] = null
      return null
    } finally {
      detailsLoadingById.value[id] = false
    }
  }

  async function toggleRow(id: number) {
    const isOpen = !!expandedRows.value[id]
    expandedRows.value[id] = !isOpen
    if (!isOpen) await fetchSubmissionDetails(id)
  }

  function getStudentId(payment: any) {
    const raw = payment?.studentId ?? payment?.student?.id
    const id = Number(raw)
    return isNaN(id) || id <= 0 ? null : id
  }

  return {
    gcashPayments,
    displayedPayments,

    isLoading,
    error,

    currentPage,
    perPage,
    totalPages,
    totalItems,

    searchQuery,
    activeFilter,

    selectedPayment,
    isApproveModalOpen,
    isRejectModalOpen,
    availableFees,

    expandedRows,
    submissionDetailsById,
    detailsLoadingById,

    stats,

    fetchPaymentSubmissions,
    resetAndRefetch,
    setPage,
    setPerPage,

    setSearchQuery,
    setActiveFilter,

    toggleRow,
    fetchSubmissionDetails,

    getStudentId,
  }
})