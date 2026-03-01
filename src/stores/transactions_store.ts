import { defineStore } from "pinia";
import { ref, computed } from "vue";
import type {
  Transaction,
  TransactionStatus,
  PaymentSubmissionStatus,
  FeeDropdownOption,
  CreatePaymentDto,
} from "@/services/api/transactions_api.ts";
import apiService from "@/services/apiService.ts";

interface NewTransactionForm {
  student_id: number | null;
  total_amount_paid: string;
  payment_method: "cash" | "gcash" | "bank" | "online" | "other";
  studentSearch: string;
}
interface Student {
  id: number;
  s_studentID: string;
  s_fname: string;
  s_mname: string | null;
  s_lname: string;
  s_suffix?: string | null;
  s_email?: string | null; 
  s_set: string;
  s_lvl: number;
  s_status: string;
  program?:
    | number
    | {
        id: number;
        name?: string;
        institute?: {
          id: number;
          institute_name: string;
        };
      };
  program_name?: string;
}

interface FeeDistribution {
  fee_id: number;
  fee_label: string;
  original_amount: number;
  distributed_amount: number;
  balance: number;
  _category?: string;
}

interface FeeDropdownOptionExtended extends FeeDropdownOption {
  balance: number;
  _rawStudentId?: number;
}


export const useTransactionsStore = defineStore("transactions", () => {

  const allTransactions = ref<Transaction[]>([]);
  const searchQuery = ref("");
  const activeFilter = ref<"all" | TransactionStatus>("all");
  const paymentSubmissionFilter = ref<"all" | PaymentSubmissionStatus>("all");

  const isCreateTransactionDialogOpen = ref(false);
  const isViewTransactionDialogOpen = ref(false);

  const selectedTransaction = ref<Transaction | null>(null);

  const isLoading = ref(false);
  const isLoadingMore = ref(false);
  const hasMore = ref(true);

  const currentPage = ref(1);
  const perPage = ref(10);
  const totalItems = ref(0);

  const newTransaction = ref<NewTransactionForm>({
    student_id: null,
    total_amount_paid: "",
    payment_method: "cash",
    studentSearch: "",
  });

  const students = ref<Student[]>([]);
  const selectedStudent = ref<Student | null>(null);
  const isLoadingStudents = ref(false);
  const studentSearchPage = ref(1);
  const studentSearchHasMore = ref(false);

  const searchDebounceTimer = ref<any>(null);

  const isLoadingFees = ref(false);
  const isLoadingFeeDetails = ref(false);

  const feeOptions = ref<FeeDropdownOption[]>([]);
  const availableFees = ref<FeeDropdownOption[]>([]);
  const feeDistribution = ref<FeeDistribution[]>([]);

  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === "Invalid Date") return "N/A";
    try {
      const d = new Date(dateString);
      if (isNaN(d.getTime())) return "Invalid Date";
      return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "Invalid Date";
    }
  };

  const parseAmount = (amountString: string | number): number => {
    if (amountString === null || amountString === undefined) return 0;
    const str =
      typeof amountString === "number"
        ? String(amountString)
        : String(amountString);
    if (!str.trim()) return 0;
    const cleaned = str.replace(/[₱$,]/g, "").trim();
    const parsed = parseFloat(cleaned);
    return isNaN(parsed) ? 0 : Math.abs(parsed);
  };

  const getFullStudentName = (
    student: Pick<Student, "s_fname" | "s_mname" | "s_lname" | "s_suffix">,
  ): string => {
    const parts = [
      student.s_fname,
      student.s_mname,
      student.s_lname,
      student.s_suffix && String(student.s_suffix).trim() !== ""
        ? student.s_suffix
        : null,
    ].filter(Boolean);
    return parts.join(" ").trim() || "Unknown";
  };

  function getStudentDisplayName(student: Student): string {
    const name = student.s_lname
      ? getFullStudentName(student)
      : student.s_fname;
    const studentId = student.s_studentID || `ID-${student.id}`;
    return `${studentId} - ${name}`;
  }

  const transactionsWithCorrectedNames = computed(() => {
    return allTransactions.value.map((transaction) => ({
      ...transaction,
      dueDate: formatDate(transaction.dueDate),
      paymentDate: formatDate(transaction.createdAt),
    }));
  });

  const filteredTransactions = computed(() => {
    const q = searchQuery.value.toLowerCase().trim();

    return transactionsWithCorrectedNames.value.filter((t) => {
      const matchesSearch =
        !q ||
        t.transactionNumber.toLowerCase().includes(q) ||
        t.studentId.toLowerCase().includes(q) ||
        t.student.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q);

      const matchesFilter =
        activeFilter.value === "all" || t.status === activeFilter.value;

      const matchesSubmission =
        paymentSubmissionFilter.value === "all" ||
        t.paymentSubmissionStatus === paymentSubmissionFilter.value;

      return matchesSearch && matchesFilter && matchesSubmission;
    });
  });


  const displayedTransactions = computed(() => {
    return [...filteredTransactions.value].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  });

  const totalPages = computed(() =>
    Math.ceil(totalItems.value / perPage.value),
  );

  const transactionStats = computed(() => {
    const sentCount = allTransactions.value.filter(
      (i) => i.status === "sent",
    ).length;
    const paidCount = allTransactions.value.filter(
      (i) => i.status === "paid",
    ).length;
    const overdueCount = allTransactions.value.filter(
      (i) => i.status === "overdue",
    ).length;

    const pendingSubmissions = allTransactions.value.filter(
      (i) => i.paymentSubmissionStatus === "pending",
    ).length;
    const approvedSubmissions = allTransactions.value.filter(
      (i) => i.paymentSubmissionStatus === "approved",
    ).length;
    const rejectedSubmissions = allTransactions.value.filter(
      (i) => i.paymentSubmissionStatus === "rejected",
    ).length;

    return {
      sentCount,
      paidCount,
      overdueCount,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      totalTransactions: allTransactions.value.length,
    };
  });

  const distributionStats = computed(() => {
    const totalOriginal = feeDistribution.value.reduce(
      (sum, fee) => sum + fee.original_amount,
      0,
    );
    const totalDistributed = feeDistribution.value.reduce(
      (sum, fee) => sum + fee.distributed_amount,
      0,
    );
    const totalBalanceLocal = feeDistribution.value.reduce(
      (sum, fee) => sum + fee.balance,
      0,
    );
    const inputAmount = parseFloat(newTransaction.value.total_amount_paid) || 0;

    return {
      totalOriginal,
      totalDistributed,
      totalBalance: totalBalanceLocal,
      inputAmount,
      isOverpaying: inputAmount > totalOriginal,
      remainingToDistribute: Math.max(0, inputAmount - totalBalanceLocal),
    };
  });


  function processPaymentData(payment: any): Transaction | null {
    const feeData = payment?.fee;
    if (!feeData) return null;

    const studentData = feeData.student;

    const studentName = studentData?.full_name || "Unknown";
    const studentId = studentData?.id ? `ID-${studentData.id}` : "N/A";

    const feeStatus = String(feeData.status || "").toLowerCase();
    let status: TransactionStatus = "pending";
    if (feeStatus === "paid") status = "paid";
    else if (feeStatus === "overdue") status = "overdue";
    else if (feeStatus === "partial") status = "sent";

    let paymentSubmissionStatus: PaymentSubmissionStatus = "none";
    if (payment.payment_submission) {
      const s = String(payment.payment_submission).toLowerCase();
      if (s === "pending") paymentSubmissionStatus = "pending";
      else if (s === "approved") paymentSubmissionStatus = "approved";
      else if (s === "rejected") paymentSubmissionStatus = "rejected";
    }

    const category = feeData.category_name || feeData.category || "General";
    const amount = parseFloat(payment.amount_paid || "0");
    const dueDate = feeData.due_date || payment.due_date || "";

    return {
      id: String(payment.id),
      transactionNumber: `TXN-${payment.id}`,
      studentId,
      student: studentName,
      category,
      amount,
      dueDate,
      status,
      paymentSubmissionStatus,
      paymentDate: payment.created_at || "",
      paymentMethod: payment.payment_method || "cash",
      createdAt: payment.created_at,
      updatedAt: payment.updated_at,
      received_by:
        typeof payment.received_by === "string"
          ? payment.received_by
          : payment.received_by?.username ||
            payment.received_by?.name ||
            "Unknown",
      fee_id: feeData.id,
      payment_submission_id: payment.payment_submission || undefined,
    };
  }

  async function fetchTransactions(page = 1, opts?: { append?: boolean }) {
    const append = opts?.append ?? page > 1;

    try {
      if (!append) isLoading.value = true;
      else isLoadingMore.value = true;

      const response = await apiService.get("/api/v1/payments/", {
        page,
        per_page: perPage.value,
        ordering: "-created_at",
      });

      const payload = response.data;
      const list = payload?.data as any; 

      const rawItems = Array.isArray((list as any)?.data)
        ? (list as any).data
        : Array.isArray((payload as any)?.data)
          ? (payload as any).data
          : [];

      const processed = rawItems
        .map(processPaymentData)
        .filter((t): t is Transaction => t !== null);

      const existing = new Set(allTransactions.value.map((t) => String(t.id)));
      const fresh = processed.filter((t) => !existing.has(String(t.id)));

      if (!append) allTransactions.value = fresh;
      else allTransactions.value = [...allTransactions.value, ...fresh];

      const current_page = (list as any)?.current_page ?? page;
      const per_page = (list as any)?.per_page ?? perPage.value;
      const total_items = (list as any)?.total_items ?? totalItems.value;
      const total_pages =
        (list as any)?.total_pages ??
        Math.ceil((total_items || 0) / (per_page || perPage.value));

      currentPage.value = current_page;
      perPage.value = per_page;
      totalItems.value = total_items;

      hasMore.value = currentPage.value < total_pages;
    } catch (e) {
      console.error("Error fetching transactions:", e);
      if (!append) allTransactions.value = [];
      hasMore.value = false;
    } finally {
      isLoading.value = false;
      isLoadingMore.value = false;
    }
  }

  async function loadMore() {
    if (isLoading.value || isLoadingMore.value) return;
    if (!hasMore.value) return;
    await fetchTransactions(currentPage.value + 1, { append: true });
  }

  async function resetAndRefetch() {
    currentPage.value = 1;
    hasMore.value = true;
    allTransactions.value = [];
    await fetchTransactions(1, { append: false });
  }

  async function handleSearch() {
    await resetAndRefetch();
  }

  async function handleFilterChange() {
    await resetAndRefetch();
  }

  async function handlePaymentSubmissionFilterChange() {
    await resetAndRefetch();
  }

  function splitFullName(fullName: string) {
    const parts = (fullName || "").trim().split(/\s+/);
    if (parts.length === 0)
      return { fname: "", mname: null, lname: "", suffix: null };
    if (parts.length === 1)
      return { fname: parts[0], mname: null, lname: "", suffix: null };

    const fname = parts[0];
    const lname = parts[parts.length - 1];
    const middle = parts.slice(1, -1).join(" ");
    return { fname, mname: middle || null, lname, suffix: null };
  }

  function addAllFeesToDistribution() {
    const ids = availableFees.value.map((f: any) => f.value);
    ids.forEach((id) => addFeeToDistribution(id));
  }

  async function searchStudentsWithFees(searchTerm: string) {
    const term = (searchTerm || "").trim();
    if (term.length < 2) {
      students.value = [];
      return;
    }

    try {
      isLoadingStudents.value = true;

      const res = await apiService.get("/api/v1/fees/", {
        search: term,
        per_page: 50,
        current_page: 1,
        ordering: "-id",
      });

      const fees: any[] = Array.isArray(res?.data?.data) ? res.data.data : [];

      const uniq = new Map<number, Student>();
      for (const fee of fees) {
        const s = fee?.student;
        if (!s?.id || uniq.has(s.id)) continue;

        const n = splitFullName(s.full_name || "");
        uniq.set(s.id, {
          id: s.id,
          s_studentID: `ID-${s.id}`,
          s_fname: n.fname || "Unknown",
          s_mname: n.mname || null,
          s_lname: n.lname || "",
          s_suffix: null,
          s_email: null,
          s_set: s.s_set || "",
          s_lvl: s.s_lvl || 0,
          s_status: "enrolled",
          program: { id: 0, name: s.program_name || "" },
        });
      }

      students.value = Array.from(uniq.values());
    } catch (e) {
      console.error("searchStudentsWithFees error:", e);
      students.value = [];
    } finally {
      isLoadingStudents.value = false;
    }
  }

  async function triggerStudentSearch(query?: string) {
    const term = (query ?? newTransaction.value.studentSearch ?? "").trim();
    await searchStudentsWithFees(term);
  }

  function selectStudent(student: Student) {
    selectedStudent.value = student;
    newTransaction.value.student_id = student.id;
    newTransaction.value.studentSearch = getStudentDisplayName(student);
    students.value = []; 
  }

  function clearSelectedStudent() {
    selectedStudent.value = null;
    newTransaction.value.student_id = null;
    newTransaction.value.studentSearch = "";
    students.value = [];
    feeOptions.value = [];
    feeDistribution.value = [];
    availableFees.value = [];
  }

async function loadStudentFees(studentId: number) {
  try {
    isLoadingFees.value = true;
    isLoadingFeeDetails.value = true;

    const [pendingRes, overdueRes] = await Promise.all([
      apiService.get("/api/v1/fees/", {
        student_id: studentId,
        per_page: 100,
        status: "pending",
        ordering: "due_date",
      }),
      apiService.get("/api/v1/fees/", {
        student_id: studentId,
        per_page: 100,
        status: "overdue",
        ordering: "due_date",
      }),
    ]);

    const pendingFees = Array.isArray(pendingRes?.data?.data) ? pendingRes.data.data : [];
    const overdueFees = Array.isArray(overdueRes?.data?.data) ? overdueRes.data.data : [];
    const fees = [...pendingFees, ...overdueFees];

    const validFees: FeeDropdownOptionExtended[] = fees
      .map((fee: any) => {
        const amount = parseAmount(fee.total_amount || "0");
        const balance = parseAmount(fee.balance || "0");
        const s = fee.student || {};
        return {
          value: fee.id,
          label: `${fee.category_name || "Unknown"} - ₱${amount.toFixed(2)}`,
          amount,
          balance,
          status: fee.status || "pending",
          category: fee.category_name || "Unknown",
          studentId: s?.s_studentID || `ID-${s?.id || "N/A"}`,
          studentName: s?.full_name || "Unknown",
          id: fee.id,
          due_date: fee.due_date || "",
          _rawStudentId: s?.id,
        } as FeeDropdownOptionExtended;
      })
      .filter((f) => f._rawStudentId === studentId && f.balance > 0);

    feeOptions.value = validFees;
    availableFees.value = [...validFees];
    feeDistribution.value = [];
  } catch (e) {
    console.error("Error loading fees:", e);
    feeOptions.value = [];
    availableFees.value = [];
    feeDistribution.value = [];
  } finally {
    isLoadingFees.value = false;
    isLoadingFeeDetails.value = false;
  }
}


  function addFeeToDistribution(feeId: number) {
    if (isLoadingFeeDetails.value) return;

    const idx = availableFees.value.findIndex((f: any) => f.value === feeId);
    if (idx === -1) return;

    const fee: any = availableFees.value[idx];
    const actualFeeId = fee.id || fee.value;
    if (typeof actualFeeId !== "number") return;

    feeDistribution.value.push({
      fee_id: actualFeeId,
      fee_label: `${fee.category} (${fee.studentId})`,
      original_amount: fee.amount,
      distributed_amount: 0,
      balance: fee.balance,
      _category: fee.category,
    });

    availableFees.value.splice(idx, 1);

    const totalAmount = parseFloat(newTransaction.value.total_amount_paid) || 0;
    if (totalAmount > 0) updateFeeDistribution(totalAmount);
  }

  function removeFeeFromDistribution(index: number) {
    if (index < 0 || index >= feeDistribution.value.length) return;

    const removed = feeDistribution.value[index];
    const original = feeOptions.value.find(
      (f: any) => f.value === removed.fee_id,
    );
    if (original) availableFees.value.push(original);

    feeDistribution.value.splice(index, 1);

    const total = parseFloat(newTransaction.value.total_amount_paid) || 0;
    updateFeeDistribution(total);
  }

  function updateFeeDistribution(totalAmount: number) {
    if (feeDistribution.value.length === 0) return;

    let remainingAmount = totalAmount;
    const totalBal = feeDistribution.value.reduce(
      (sum, fee) => sum + fee.balance,
      0,
    );

    if (totalAmount < totalBal) {
      feeDistribution.value.forEach((fee) => {
        const proportion = fee.balance / totalBal;
        fee.distributed_amount = parseFloat(
          (proportion * totalAmount).toFixed(2),
        );
        fee.balance = parseFloat(
          (fee.original_amount - fee.distributed_amount).toFixed(2),
        );
        remainingAmount -= fee.distributed_amount;
      });
    } else {
      feeDistribution.value.forEach((fee) => {
        const payment = Math.min(fee.original_amount, remainingAmount);
        fee.distributed_amount = parseFloat(payment.toFixed(2));
        fee.balance = parseFloat((fee.original_amount - payment).toFixed(2));
        remainingAmount -= payment;
      });
    }

    const actualTotal = feeDistribution.value.reduce(
      (sum, fee) => sum + fee.distributed_amount,
      0,
    );
    newTransaction.value.total_amount_paid = actualTotal.toFixed(2);
  }

  function updateDistributedAmount(index: number, amount: number) {
    const fee = feeDistribution.value[index];
    const clamped = Math.max(0, Math.min(amount, fee.original_amount));
    fee.distributed_amount = parseFloat(clamped.toFixed(2));
    fee.balance = parseFloat(
      (fee.original_amount - fee.distributed_amount).toFixed(2),
    );

    const newTotal = feeDistribution.value.reduce(
      (sum, f) => sum + f.distributed_amount,
      0,
    );
    newTransaction.value.total_amount_paid = newTotal.toFixed(2);
  }

  async function handleCreateTransaction() {
    if (
      !selectedStudent.value ||
      feeDistribution.value.length === 0 ||
      !newTransaction.value.total_amount_paid
    ) {
      alert(
        "Please select a student, add at least one fee to pay, and enter total amount",
      );
      return;
    }

    const totalAmount = parseFloat(newTransaction.value.total_amount_paid);
    if (!(totalAmount > 0)) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    const totalDistributed = feeDistribution.value.reduce(
      (sum, fee) => sum + fee.distributed_amount,
      0,
    );
    if (Math.abs(totalDistributed - totalAmount) > 0.01) {
      alert("Distributed amount doesn't match total amount");
      return;
    }

    try {
      const paymentsToCreate: CreatePaymentDto[] = feeDistribution.value
        .filter((f) => f.distributed_amount > 0)
        .map((f) => ({
          fee: f.fee_id,
          amount_paid: f.distributed_amount.toFixed(2),
          payment_method: newTransaction.value.payment_method,
          payment_submission: null,
        }));

      const results = await Promise.all(
        paymentsToCreate.map((p) => apiService.post("/api/v1/payments/", p)),
      );
      const ok = results.every((r) => r.status >= 200 && r.status < 300);

      if (ok) {
        isCreateTransactionDialogOpen.value = false;
        resetForm();
        alert(`Successfully created ${paymentsToCreate.length} payment(s)!`);
        await resetAndRefetch();
      } else {
        alert("Failed to create some payments");
      }
    } catch (e: any) {
      console.error("Error creating transaction:", e);
      alert(`Error: ${e?.message || "Please try again"}`);
    }
  }

  function resetForm() {
    newTransaction.value = {
      student_id: null,
      total_amount_paid: "",
      payment_method: "cash",
      studentSearch: "",
    };
    selectedStudent.value = null;
    students.value = [];
    feeOptions.value = [];
    availableFees.value = [];
    feeDistribution.value = [];
  }

  const showDialog = (transaction: Transaction) => {
    selectedTransaction.value = transaction;
    isViewTransactionDialogOpen.value = true;
  };

  const hideDialog = () => {
    isViewTransactionDialogOpen.value = false;
    selectedTransaction.value = null;
  };

  async function initialize() {
    await fetchTransactions(1, { append: false });
  }

  return {
    allTransactions,
    searchQuery,
    activeFilter,
    paymentSubmissionFilter,
    isCreateTransactionDialogOpen,
    isViewTransactionDialogOpen,
    selectedTransaction,
    isLoading,
    isLoadingMore,
    hasMore,
    currentPage,
    perPage,
    totalItems,

    newTransaction,

    students,
    selectedStudent,
    isLoadingStudents,
    studentSearchPage,
    studentSearchHasMore,
    searchDebounceTimer,

    feeOptions,
    availableFees,
    feeDistribution,
    isLoadingFees,
    isLoadingFeeDetails,

    transactionsWithCorrectedNames,
    filteredTransactions,
    displayedTransactions,
    totalPages,
    transactionStats,
    distributionStats,

    fetchTransactions,
    loadMore,
    resetAndRefetch,
    handleSearch,
    handleFilterChange,
    handlePaymentSubmissionFilterChange,

    triggerStudentSearch,
    selectStudent,
    clearSelectedStudent,

    loadStudentFees,
    addFeeToDistribution,
    removeFeeFromDistribution,
    updateFeeDistribution,
    updateDistributedAmount,
    searchStudentsWithFees,
    handleCreateTransaction,
    resetForm,

    showDialog,
    hideDialog,

    getStudentDisplayName,
    initialize,
    addAllFeesToDistribution,
  };
});
