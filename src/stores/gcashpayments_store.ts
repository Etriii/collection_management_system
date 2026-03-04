import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type { Ref } from "vue";
import type { PaymentApproval, StudentFee } from "@/core/types";
import gcashpayments_api from "@/services/api/gcashpayments_api";

type Priority = "high" | "medium" | "low";
type Filter = "all" | Priority;

type PaymentSubmissionListItem = {
  id: number;
  student: {
    id: number;
    full_name: string;
    program_name: string;
    s_set: string;
    s_lvl: number;
  };
  screenshot_urls: string[];
  reviewed_by: string | null;
  total_amount_paid: string;
  reference_number: string;
  status: "pending" | "approved" | "rejected";
  fee_payment_count: number;
  created_at: string;
};

type PaymentSubmissionListResponse = {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
  data: PaymentSubmissionListItem[];
};

type SubmissionFeeItem = {
  id: number;
  previous_balance: string;
  amount_paid: string;
  fee: {
    id: number;
    category_id: string;
    category_name: string;
    total_amount: string;
    balance: string;
    status: string;
    due_date: string | null;
  };
};

type PaymentSubmissionDetail = {
  id: number;
  student: {
    id: number;
    full_name: string;
    program_name: string;
    s_set: string;
    s_lvl: number;
  };
  screenshot_urls: string[];
  reviewed_by: string | null;
  fee_items: SubmissionFeeItem[];
  created_at: string;
  updated_at: string;
  total_amount_paid: string;
  reference_number: string;
  status: "pending" | "approved" | "rejected";
  reviewed_at: string | null;
  remarks: string | null;
  updated_by: number | null;
};

export const useGcashpaymentsStore = defineStore("gcashpayments", () => {

  const gcashPayments: Ref<PaymentApproval[]> = ref([]);
  const displayedPayments: Ref<PaymentApproval[]> = ref([]);

  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const error = ref<string | null>(null);

  const currentPage = ref(1);
  const perPage = ref(10);
  const totalPages = ref(1);
  const totalItems = ref(0);
  const hasMore = ref(true);

  const searchQuery = ref("");
  const activeFilter = ref<Filter>("all");

  // modals
  const selectedPayment = ref<PaymentApproval | null>(null);
  const isApproveModalOpen = ref(false);
  const isRejectModalOpen = ref(false);

  const availableFees = ref<StudentFee[]>([]);

  const expandedRows = ref<Record<number, boolean>>({});
  const submissionDetailsById = ref<
    Record<number, PaymentSubmissionDetail | null>
  >({});
  const detailsLoadingById = ref<Record<number, boolean>>({});

  function calculateDaysAgo(dateString: string): number {
    const created = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  function determinePriority(
    amountPaidStr: string,
    createdAt: string,
  ): Priority {
    const amount = parseFloat(amountPaidStr || "0");
    const daysAgo = calculateDaysAgo(createdAt);

    if (amount > 5000 || daysAgo > 7) return "high";
    if (amount > 1000 || daysAgo > 3) return "medium";
    return "low";
  }

  function mapSubmissionToApproval(
    item: PaymentSubmissionListItem,
  ): PaymentApproval {
    const name = item.student?.full_name || "Unknown Student";
    const studentId = item.student?.id ? String(item.student.id) : "";
    const amountPaid = item.total_amount_paid || "0";

    const priority = determinePriority(amountPaid, item.created_at);
    const daysAgo = calculateDaysAgo(item.created_at);

    return {
      id: item.id,
      name,
      studentId,
      amount_paid: amountPaid,
      reference_number: item.reference_number || "",
      created_at: item.created_at,
      screenshot_urls: Array.isArray(item.screenshot_urls)
        ? item.screenshot_urls
        : [],
      screenshot: item.screenshot_urls?.[0] || "",
      status: item.status,
      priority,
      daysAgo,
      feeType: "GCash Submission",
      sender: item.reviewed_by || "",
      description: `${name} - ${item.reference_number || ""}`,
      notes: undefined,
      student: item.student?.id ?? 0,
      fee: 0,
      reviewed_at: null,
      remarks: "",
      updated_by: null,
      reviewed_by: null,
      updated_at: item.created_at,
    } as any;
  }

  function applyClientFilters(all: PaymentApproval[]) {
    const q = (searchQuery.value || "").trim().toLowerCase();

    const filtered = all.filter((p) => {
      const matchesSearch =
        !q ||
        p.name?.toLowerCase().includes(q) ||
        false ||
        p.studentId?.toLowerCase().includes(q) ||
        false ||
        p.reference_number?.toLowerCase().includes(q) ||
        false;

      const matchesFilter =
        activeFilter.value === "all" || p.priority === activeFilter.value;
      return matchesSearch && matchesFilter;
    });

    filtered.sort((a, b) => {
      if (a.status === "pending" && b.status !== "pending") return -1;
      if (a.status !== "pending" && b.status === "pending") return 1;
      return (a.daysAgo || 0) - (b.daysAgo || 0);
    });

    displayedPayments.value = filtered.slice(
      0,
      displayedPayments.value.length || perPage.value,
    );
  }

  const stats = computed(() => {
    const totalAmount = gcashPayments.value.reduce(
      (sum, p) => sum + parseFloat(p.amount_paid || "0"),
      0,
    );
    const highPriorityCount = gcashPayments.value.filter(
      (p) => p.priority === "high",
    ).length;
    return {
      pendingApprovals: gcashPayments.value.length,
      highPriorityCount,
      totalAmount,
      averageAmount:
        gcashPayments.value.length > 0
          ? totalAmount / gcashPayments.value.length
          : 0,
    };
  });


  async function fetchPaymentSubmissions(
    page = 1,
    mode: "replace" | "append" = "replace",
  ) {
    if (mode === "replace") {
      isLoading.value = true;
      error.value = null;
    } else {
      isLoadingMore.value = true;
    }

    try {
      const params = {
        current_page: page,
        per_page: perPage.value,
        ordering: "-created_at",
        // status: "pending"
      };

      const apiRes = (await gcashpayments_api.getPaymentSubmissions(
        params as any,
      )) as any;

      const rows = Array.isArray(apiRes?.results) ? apiRes.results : [];

      const mapped = rows 

      totalItems.value = apiRes.count ?? rows.length;
      totalPages.value = apiRes.next
        ? currentPage.value + 1
        : currentPage.value;
      currentPage.value = page;
      hasMore.value = !!apiRes.next;
      hasMore.value = currentPage.value < totalPages.value;

      if (mode === "replace") {
        gcashPayments.value = mapped;
        displayedPayments.value = mapped.slice(0, perPage.value);
      } else {
        const existingIds = new Set(gcashPayments.value.map((p) => p.id));
        const next = mapped.filter((p) => !existingIds.has(p.id));
        gcashPayments.value = [...gcashPayments.value, ...next];
        displayedPayments.value = [...displayedPayments.value, ...next];
      }

      applyClientFilters(gcashPayments.value);
    } catch (e: any) {
      console.error("fetchPaymentSubmissions error:", e);
      error.value = e?.message || "Failed to fetch payment submissions";
      if (mode === "replace") {
        gcashPayments.value = [];
        displayedPayments.value = [];
        totalItems.value = 0;
        totalPages.value = 1;
        currentPage.value = 1;
        hasMore.value = false;
      }
    } finally {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  }

  async function resetAndRefetch() {
    gcashPayments.value = [];
    displayedPayments.value = [];
    totalItems.value = 0;
    totalPages.value = 1;
    currentPage.value = 1;
    hasMore.value = true;

    expandedRows.value = {};
    submissionDetailsById.value = {};
    detailsLoadingById.value = {};

    await fetchPaymentSubmissions(1, "replace");
  }

  async function loadMore() {
    if (!hasMore.value || isLoading.value || isLoadingMore.value) return;
    const nextPage = currentPage.value + 1;
    await fetchPaymentSubmissions(nextPage, "append");
  }

  function setSearchQuery(v: string) {
    searchQuery.value = v;
    applyClientFilters(gcashPayments.value);
  }
  function setActiveFilter(v: Filter) {
    activeFilter.value = v;
    applyClientFilters(gcashPayments.value);
  }

  async function fetchSubmissionDetails(id: number) {
    if (submissionDetailsById.value[id]) return submissionDetailsById.value[id];

    detailsLoadingById.value[id] = true;
    try {
      const res = await gcashpayments_api.getPaymentSubmission(id);

      const detail: PaymentSubmissionDetail = (res as any)?.data?.id
        ? (res as any).data
        : (res as any);

      submissionDetailsById.value[id] = detail;
      return detail;
    } catch (e) {
      console.error("fetchSubmissionDetails error:", e);
      submissionDetailsById.value[id] = null;
      return null;
    } finally {
      detailsLoadingById.value[id] = false;
    }
  }

  async function toggleRow(id: number) {
    const isOpen = !!expandedRows.value[id];
    expandedRows.value[id] = !isOpen;

    if (!isOpen) {
      await fetchSubmissionDetails(id);
    }
  }


  function getStudentId(payment: any) {
    const raw = payment?.studentId ?? payment?.student?.id;
    const id = Number(raw);
    return isNaN(id) || id <= 0 ? null : id;
  }

  return {
    gcashPayments,
    displayedPayments,
    isLoading,
    isLoadingMore,
    error,
    currentPage,
    perPage,
    totalPages,
    totalItems,
    hasMore,

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
    loadMore,

    setSearchQuery,
    setActiveFilter,

    toggleRow,
    fetchSubmissionDetails,

    getStudentId,
  };
});
