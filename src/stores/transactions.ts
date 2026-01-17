import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Transaction, TransactionStatus, PaymentSubmissionStatus, FeeDropdownOption, CreatePaymentDto } from '@/services/api/transactions_api.ts'
import apiService from '@/services/apiService.ts'

// Interfaces
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
  s_mname: string;
  s_lname: string;
  s_suffix?: string;
  s_email: string;
  s_set: string;
  s_lvl: number;
  s_status: string;
  program?: {
    id: number;
    name: string;
    institute?: {
      id: number;
      institute_name: string;
    };
  };
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
  _rawStudentId?: number;
}

interface StudentApiResponse {
  count: number;
  next: string | null;
  previous: string | null;
  results: Student[];
}

export const useTransactionsStore = defineStore('transactions', () => {
  // State
  const allTransactions = ref<Transaction[]>([]) // All transactions loaded from API
  const searchQuery = ref("")
  const activeFilter = ref<"all" | TransactionStatus>("all")
  const paymentSubmissionFilter = ref<"all" | PaymentSubmissionStatus>("all")
  const isCreateTransactionDialogOpen = ref(false)
  const isViewTransactionDialogOpen = ref(false)
  const selectedTransaction = ref<Transaction | null>(null)
  const isLoadingFeeDetails = ref(false)
  const isLoading = ref(false)
  const currentPage = ref(1)
  const itemsPerPage = ref(10)
  const totalItems = ref(0)
  const perPage = ref(10)
  const newTransaction = ref<NewTransactionForm>({
    student_id: null,
    total_amount_paid: "",
    payment_method: "cash",
    studentSearch: ""
  })

  const students = ref<Student[]>([])
  const selectedStudent = ref<Student | null>(null)
  const isLoadingStudents = ref(false)

  const feeOptions = ref<FeeDropdownOption[]>([])
  const isLoadingFees = ref(false)

  const feeDistribution = ref<FeeDistribution[]>([])
  const availableFees = ref<FeeDropdownOption[]>([])

  const allStudents = ref<Student[]>([])
  const searchTimeout = ref<NodeJS.Timeout>()

  // Helper Functions
  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === "Invalid Date") return "N/A";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return "Invalid Date";
    }
  }

  const parseAmount = (amountString: string | number): number => {
    if (amountString === null || amountString === undefined) return 0;

    try {
      const str = typeof amountString === 'number' ? amountString.toString() : String(amountString);
      if (!str || str.trim() === '') return 0;

      const cleaned = str.replace(/[₱$,]/g, '').trim();
      const parsed = parseFloat(cleaned);
      return isNaN(parsed) ? 0 : Math.abs(parsed);
    } catch (error) {
      console.error("Error parsing amount:", amountString, error);
      return 0;
    }
  };

  const getFullStudentName = (student: Student): string => {
    const parts = [
      student.s_fname,
      student.s_mname,
      student.s_lname,
      student.s_suffix && student.s_suffix.trim() !== '' ? student.s_suffix : null
    ].filter(Boolean);
    return parts.join(' ').trim();
  }

  // Computed Properties
const transactionsWithCorrectedNames = computed(() => {
  return allTransactions.value.map(transaction => ({
    ...transaction,
    dueDate: formatDate(transaction.dueDate),
    paymentDate: formatDate(transaction.createdAt) 
  }));
});

  const filteredTransactions = computed(() => {
    const result = transactionsWithCorrectedNames.value.filter((transaction) => {
      const q = searchQuery.value.toLowerCase()
      const matchesSearch =
        transaction.transactionNumber.toLowerCase().includes(q) ||
        transaction.studentId.toLowerCase().includes(q) ||
        transaction.student.toLowerCase().includes(q) ||
        transaction.category.toLowerCase().includes(q)
      const matchesFilter =
        activeFilter.value === "all" || transaction.status === activeFilter.value
      const matchesPaymentSubmissionFilter =
        paymentSubmissionFilter.value === "all" ||
        transaction.paymentSubmissionStatus === paymentSubmissionFilter.value
      return matchesSearch && matchesFilter && matchesPaymentSubmissionFilter
    })


    return result
  })

const paginatedTransactions = computed(() => {
  console.log("🔹 filteredTransactions before sort:", filteredTransactions.value.map(t => ({
    id: t.id,
    createdAt: t.createdAt
  })));

  // Sort by createdAt descending (newest first)
  const sorted = [...filteredTransactions.value].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  console.log("🔹 sortedTransactions by createdAt:", sorted.map(t => ({
    id: t.id,
    createdAt: t.createdAt
  })));

  // Pagination
  const start = (currentPage.value - 1) * perPage.value;
  const end = start + perPage.value;
  const paginated = sorted.slice(start, end);

  console.log(`🔹 paginatedTransactions (page ${currentPage.value}):`, paginated.map(t => ({
    id: t.id,
    createdAt: t.createdAt
  })));

  return paginated;
});


  const totalPages = computed(() => {
    return Math.ceil(filteredTransactions.value.length / itemsPerPage)
  })

  const transactionStats = computed(() => {
    const sent = allTransactions.value.filter((i) => i.status === "sent")
    const paid = allTransactions.value.filter((i) => i.status === "paid")
    const overdue = allTransactions.value.filter((i) => i.status === "overdue")
    const pendingSubmissions = allTransactions.value.filter((i) => i.paymentSubmissionStatus === "pending").length
    const approvedSubmissions = allTransactions.value.filter((i) => i.paymentSubmissionStatus === "approved").length
    const rejectedSubmissions = allTransactions.value.filter((i) => i.paymentSubmissionStatus === "rejected").length

    return {
      sentCount: sent.length,
      paidCount: paid.length,
      overdueCount: overdue.length,
      pendingSubmissions,
      approvedSubmissions,
      rejectedSubmissions,
      totalTransactions: allTransactions.value.length
    }
  })

  const distributionStats = computed(() => {
    const totalOriginal = feeDistribution.value.reduce((sum, fee) => sum + fee.original_amount, 0)
    const totalDistributed = feeDistribution.value.reduce((sum, fee) => sum + fee.distributed_amount, 0)
    const totalBalance = feeDistribution.value.reduce((sum, fee) => sum + fee.balance, 0)
    const inputAmount = parseFloat(newTransaction.value.total_amount_paid) || 0

    return {
      totalOriginal,
      totalDistributed,
      totalBalance,
      inputAmount,
      isOverpaying: inputAmount > totalOriginal,
      remainingToDistribute: Math.max(0, inputAmount - totalBalance)
    }
  })

  async function fetchTransactions(page = 1) {
  try {
    isLoading.value = true;

    const response = await apiService.get('/api/v1/payments/', {
      params: {
        page: page,
        per_page: perPage.value,
        ordering: '-created_at' // API should return latest first
      }
    });

    const paginationData = response?.data;

    if (!paginationData || typeof paginationData !== 'object') {
      console.error("❌ Invalid response structure:", response);
      allTransactions.value = [];
      return;
    }

    if (!Array.isArray(paginationData.data)) {
      console.error("❌ Data is not an array:", paginationData);
      allTransactions.value = [];
      return;
    }

    // Process transactions
    const processedTransactions = paginationData.data
      .map(processPaymentData)
      .filter(Boolean);

    // Sort by createdAt in descending order (latest first)
    processedTransactions.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime();
      const dateB = new Date(b.createdAt).getTime();
      return dateB - dateA; // Descending order
    });

    allTransactions.value = processedTransactions;

    // Update pagination state
    currentPage.value = paginationData.current_page || page;
    perPage.value = paginationData.per_page || 10;
    totalItems.value = paginationData.total_items || 0;

    console.log(`✅ Loaded ${processedTransactions.length} transactions (Page ${currentPage.value}/${paginationData.total_pages})`);

  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    allTransactions.value = [];
  } finally {
    isLoading.value = false;
  }
}
  // Updated extractDataFromResponse to match apiService behavior
  function extractDataFromResponse(data: any): any[] {
    console.log("extractDataFromResponse - Debug structure:", data);

    // If apiService already unwrapped: { current_page, ..., data: [] }
    if (data?.data && Array.isArray(data.data)) {
      console.log("✅ Extracting from data.data (pagination object), length:", data.data.length);
      return data.data;
    }

    // If response is directly the array (no wrapper)
    if (Array.isArray(data)) {
      console.log("✅ Extracting from data (direct array), length:", data.length);
      return data;
    }

    // Handle fully wrapped response if apiService doesn't unwrap: { status_code, message, data: {...} }
    if (data?.data?.data && Array.isArray(data.data.data)) {
      console.log("✅ Extracting from data.data.data (wrapped pagination), length:", data.data.data.length);
      return data.data.data;
    }

    console.warn("❌ Could not find array in response:", data);
    return [];
  }

  function goToPage(page: number) {
    // Calculate total pages dynamically
    const calculatedTotalPages = Math.ceil(totalItems.value / perPage.value)
    if (page < 1 || page > calculatedTotalPages) return
    currentPage.value = page
    fetchTransactions(page)
  }


  // Helper function to process payment data into Transaction format
  function processPaymentData(payment: any): Transaction | null {
    try {
      // Your payment data structure from the API
      console.log("Processing payment:", payment);

      const feeData = payment.fee;
      if (!feeData) {
        console.warn("No fee data in payment:", payment);
        return null;
      }

      const studentData = feeData.student;
      if (!studentData) {
        console.warn("No student data in fee:", feeData);
        return null;
      }

      // Get s_studentID from the student data
      let studentId = "N/A";
      if (studentData.s_studentID && studentData.s_studentID.trim() !== '') {
        studentId = studentData.s_studentID.trim();
      } else {
        studentId = `ID-${studentData.id}`;
      }

      // Build full name
      const nameParts = [
        studentData.s_fname?.trim(),
        studentData.s_mname?.trim(),
        studentData.s_lname?.trim()
      ].filter(Boolean);
      let studentName = nameParts.join(' ');
      if (studentData.s_suffix && studentData.s_suffix.trim() !== '') {
        studentName += ` ${studentData.s_suffix.trim()}`;
      }

      // Determine status from fee status
      const feeStatus = feeData.status?.toLowerCase();
      let status: TransactionStatus = "pending";
      if (feeStatus === 'paid') status = "paid";
      else if (feeStatus === 'overdue') status = "overdue";
      else if (feeStatus === 'partial') status = "sent";

      // Determine payment submission status
      let paymentSubmissionStatus: PaymentSubmissionStatus = "none";
      if (payment.payment_submission) {
        const submissionStatus = payment.payment_submission;
        if (submissionStatus === 'pending') paymentSubmissionStatus = "pending";
        else if (submissionStatus === 'approved') paymentSubmissionStatus = "approved";
        else if (submissionStatus === 'rejected') paymentSubmissionStatus = "rejected";
      }

      // Get category
      const category = feeData.category_name || feeData.category || 'General';

      // Get amount
      const amount = parseFloat(payment.amount_paid || "0");

      // Get due date
      const dueDate = feeData.due_date || payment.due_date || '';

      const transaction: Transaction = {
        id: payment.id.toString(),
        transactionNumber: `TXN-${payment.id}`,
        studentId: studentId,
        student: studentName,
        category: category,
        amount: amount,
        dueDate: dueDate,
        status: status,
        paymentSubmissionStatus: paymentSubmissionStatus,
        paymentDate: payment.created_at || '',
        paymentMethod: payment.payment_method || 'cash',
        createdAt: payment.created_at,
        updatedAt: payment.updated_at,
        received_by: payment.received_by?.username || payment.received_by?.name,
        fee_id: feeData.id,
        payment_submission_id: payment.payment_submission || undefined
      };

      return transaction;
    } catch (error) {
      console.error("❌ Error processing payment:", payment, error);
      return null;
    }
  }

  // Actions - Student Management
  async function loadAllStudents() {
    try {
      const response = await apiService.get<any>('/api/v1/students/', {
        params: {
          page: 1,
          per_page: 1000,
          s_status: 'enrolled',
          ordering: 's_studentID'
        }
      });

      const students = extractDataFromResponse(response.data);
      allStudents.value = students;

    } catch (error) {
      console.error("Error loading all students:", error);
      allStudents.value = [];
    }
  }

  async function searchStudents(searchTerm: string) {
    try {
      isLoadingStudents.value = true;

      if (allStudents.value.length === 0) {
        await loadAllStudents();
      }

      const searchLower = searchTerm.toLowerCase().trim();
      students.value = allStudents.value.filter(student => {
        const fullName = getFullStudentName(student).toLowerCase();
        return (
          fullName.includes(searchLower) ||
          (student.s_studentID?.toLowerCase() || '').includes(searchLower) ||
          (student.s_email?.toLowerCase() || '').includes(searchLower)
        );
      });

    } catch (error: any) {
      console.error("Error searching students:", error);
      students.value = [];
    } finally {
      isLoadingStudents.value = false;
    }
  }

  function getStudentDisplayName(student: Student): string {
    const name = getFullStudentName(student);
    const studentId = student.s_studentID || `ID-${student.id}`;
    return `${studentId} - ${name}`;
  }

  function selectStudent(student: Student) {
    selectedStudent.value = student;
    newTransaction.value.student_id = student.id;
    newTransaction.value.studentSearch = getStudentDisplayName(student);
    loadStudentFees(student.id);
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

  // Actions - Fee Management
  async function loadStudentFees(studentId: number) {
    try {
      isLoadingFees.value = true;
      isLoadingFeeDetails.value = true;

      console.log(`=== Loading fees for student ID: ${studentId} ===`);

      const response = await apiService.get<any>('/api/v1/fees/', {
        params: {
          student_id: studentId,
          per_page: 100,
          status: 'pending,partial,overdue',
          ordering: 'due_date'
        }
      });

      // Debug the response structure
      console.log("Fees API Response:", response);
      console.log("Fees API Response data:", response.data);

      const fees = extractDataFromResponse(response.data);
      console.log(`Extracted ${fees.length} fees from response`);

      const validFees: FeeDropdownOptionExtended[] = fees
        .map((fee: any) => {
          const amount = parseAmount(fee.total_amount || '0');
          const balance = parseAmount(fee.balance || '0');
          const student = fee.student || {};
          const feeStudentId = student.id;

          return {
            value: fee.id,
            label: `${fee.category_name || 'Unknown'} - ₱${amount.toFixed(2)}`,
            amount: amount,
            balance: balance,
            status: fee.status || 'pending',
            category: fee.category_name || 'Unknown',
            studentId: student.s_studentID || `ID-${student.id || 'N/A'}`,
            studentName: getFullStudentName(student),
            id: fee.id,
            due_date: fee.due_date || '',
            _rawStudentId: feeStudentId
          } as FeeDropdownOptionExtended;
        })
        .filter((fee: FeeDropdownOptionExtended) => {
          const matchesStudent = fee._rawStudentId === studentId;
          const hasBalance = fee.balance > 0;
          return matchesStudent && hasBalance;
        });

      console.log(`✅ Final result: ${validFees.length} valid fees for student ${studentId}`);

      feeOptions.value = validFees;
      availableFees.value = [...validFees];
      feeDistribution.value = [];

    } catch (error) {
      console.error("Error loading fees:", error);
      feeOptions.value = [];
      availableFees.value = [];
    } finally {
      isLoadingFees.value = false;
      isLoadingFeeDetails.value = false;
    }
  }

  function addFeeToDistribution(feeId: number) {
    if (isLoadingFeeDetails.value) return;

    const feeIndex = availableFees.value.findIndex(f => f.value === feeId);
    if (feeIndex === -1) return;

    const fee = availableFees.value[feeIndex];
    const actualFeeId = fee.id || fee.value;

    if (typeof actualFeeId !== 'number') {
      console.error("Invalid fee ID:", actualFeeId);
      return;
    }

    feeDistribution.value.push({
      fee_id: actualFeeId,
      fee_label: `${fee.category} (${fee.studentId})`,
      original_amount: fee.amount,
      distributed_amount: 0,
      balance: fee.balance,
      _category: fee.category
    });

    availableFees.value.splice(feeIndex, 1);

    const totalAmount = parseFloat(newTransaction.value.total_amount_paid) || 0;
    if (totalAmount > 0) {
      updateFeeDistribution(totalAmount);
    }
  }

  function removeFeeFromDistribution(index: number) {
    if (index < 0 || index >= feeDistribution.value.length) return;

    const removedFee = feeDistribution.value[index];
    const originalFee = feeOptions.value.find(f => f.value === removedFee.fee_id);

    if (originalFee) {
      availableFees.value.push(originalFee);
    }

    feeDistribution.value.splice(index, 1);

    const total = parseFloat(newTransaction.value.total_amount_paid) || 0;
    updateFeeDistribution(total);
  }

  function updateFeeDistribution(totalAmount: number) {
    if (feeDistribution.value.length === 0) return;

    let remainingAmount = totalAmount;
    const totalBalance = feeDistribution.value.reduce((sum, fee) => sum + fee.balance, 0);

    if (totalAmount < totalBalance) {
      feeDistribution.value.forEach(fee => {
        const proportion = fee.balance / totalBalance;
        fee.distributed_amount = parseFloat((proportion * totalAmount).toFixed(2));
        fee.balance = parseFloat((fee.original_amount - fee.distributed_amount).toFixed(2));
        remainingAmount -= fee.distributed_amount;
      });
    } else {
      feeDistribution.value.forEach(fee => {
        const payment = Math.min(fee.original_amount, remainingAmount);
        fee.distributed_amount = parseFloat(payment.toFixed(2));
        fee.balance = parseFloat((fee.original_amount - payment).toFixed(2));
        remainingAmount -= payment;
      });
    }

    const actualTotal = feeDistribution.value.reduce((sum, fee) => sum + fee.distributed_amount, 0);
    newTransaction.value.total_amount_paid = actualTotal.toFixed(2);
  }

  function updateDistributedAmount(index: number, amount: number) {
    const fee = feeDistribution.value[index];
    amount = Math.max(0, Math.min(amount, fee.original_amount));
    amount = parseFloat(amount.toFixed(2));

    fee.distributed_amount = amount;
    fee.balance = parseFloat((fee.original_amount - amount).toFixed(2));

    const newTotal = feeDistribution.value.reduce((sum, f) => sum + f.distributed_amount, 0);
    newTransaction.value.total_amount_paid = newTotal.toFixed(2);
  }

  // Actions - Transaction Creation
  async function handleCreateTransaction() {
    if (!selectedStudent.value || feeDistribution.value.length === 0 || !newTransaction.value.total_amount_paid) {
      alert("Please select a student, add at least one fee to pay, and enter total amount");
      return;
    }

    const invalidFees = feeDistribution.value.filter(feeDist =>
      typeof feeDist.fee_id !== 'number' || isNaN(feeDist.fee_id)
    );

    if (invalidFees.length > 0) {
      console.error("Invalid fee IDs:", invalidFees);
      alert("Some fees have invalid IDs. Please try again.");
      return;
    }

    const totalAmount = parseFloat(newTransaction.value.total_amount_paid);
    if (totalAmount <= 0) {
      alert("Please enter a valid amount greater than 0");
      return;
    }

    const totalDistributed = feeDistribution.value.reduce((sum, fee) => sum + fee.distributed_amount, 0);
    if (Math.abs(totalDistributed - totalAmount) > 0.01) {
      alert("Distributed amount doesn't match total amount");
      return;
    }

    try {
      const paymentsToCreate: CreatePaymentDto[] = feeDistribution.value
        .filter(feeDist => feeDist.distributed_amount > 0)
        .map(feeDist => ({
          fee: feeDist.fee_id,
          amount_paid: feeDist.distributed_amount.toFixed(2),
          payment_method: newTransaction.value.payment_method,
          payment_submission: null
        }));

      if (paymentsToCreate.length === 0) {
        alert("No valid payments to create");
        return;
      }

      const results = await Promise.all(
        paymentsToCreate.map(payment =>
          apiService.post('/api/v1/payments/', payment)
        )
      );

      const allSuccess = results.every(result =>
        result.status >= 200 && result.status < 300
      );

      if (allSuccess) {
        isCreateTransactionDialogOpen.value = false;
        resetForm();
        alert(`Successfully created ${paymentsToCreate.length} payment(s)!`);
        await fetchTransactions(); // Reload all transactions
      } else {
        alert("Failed to create some payments");
      }

    } catch (error: any) {
      console.error("Error creating transaction:", error);
      alert(`Error: ${error.message || "Please try again"}`);
    }
  }

  function resetForm() {
    newTransaction.value = {
      student_id: null,
      total_amount_paid: "",
      payment_method: "cash",
      studentSearch: ""
    };
    selectedStudent.value = null;
    feeOptions.value = [];
    availableFees.value = [];
    feeDistribution.value = [];
    students.value = [];
  }

  // UI Actions
  const showDialog = (transaction: Transaction) => {
    selectedTransaction.value = transaction;
    isViewTransactionDialogOpen.value = true;
  };

  const hideDialog = () => {
    isViewTransactionDialogOpen.value = false;
    selectedTransaction.value = null;
  };

  function handleSearch() {
    currentPage.value = 1; // Reset to first page when searching
  }

  function handleFilterChange() {
    currentPage.value = 1; // Reset to first page when filtering
  }

  function handlePaymentSubmissionFilterChange() {
    currentPage.value = 1; // Reset to first page when filtering
  }

  // function goToPage(page: number) {
  //   if (page < 1 || page > totalPages.value) return
  //   fetchTransactions(page)
  // }

  // Distribution Helpers
  function autoDistributeEvenly() {
    if (feeDistribution.value.length === 0) return;

    const totalAmount = parseFloat(newTransaction.value.total_amount_paid) || 0;
    if (totalAmount <= 0) return;

    const perFeeAmount = totalAmount / feeDistribution.value.length;
    let remainingAmount = totalAmount;

    feeDistribution.value.forEach((fee, index) => {
      const amount = index === feeDistribution.value.length - 1
        ? remainingAmount
        : perFeeAmount;

      const actualAmount = Math.min(amount, fee.original_amount);
      fee.distributed_amount = parseFloat(actualAmount.toFixed(2));
      fee.balance = parseFloat((fee.original_amount - actualAmount).toFixed(2));
      remainingAmount -= actualAmount;
    });

    const actualTotal = feeDistribution.value.reduce((sum, fee) => sum + fee.distributed_amount, 0);
    newTransaction.value.total_amount_paid = actualTotal.toFixed(2);
  }

  function autoDistributeProportionally() {
    if (feeDistribution.value.length === 0) return;

    const totalAmount = parseFloat(newTransaction.value.total_amount_paid) || 0;
    if (totalAmount <= 0) return;

    const totalBalance = feeDistribution.value.reduce((sum, fee) => sum + fee.balance, 0);
    let remainingAmount = totalAmount;

    feeDistribution.value.forEach((fee, index) => {
      const proportion = fee.balance / totalBalance;
      const amount = index === feeDistribution.value.length - 1
        ? remainingAmount
        : proportion * totalAmount;

      const actualAmount = parseFloat(Math.min(amount, fee.balance).toFixed(2));
      fee.distributed_amount = actualAmount;
      fee.balance = parseFloat((fee.balance - actualAmount).toFixed(2));
      remainingAmount -= actualAmount;
    });

    const actualTotal = feeDistribution.value.reduce((sum, fee) => sum + fee.distributed_amount, 0);
    newTransaction.value.total_amount_paid = actualTotal.toFixed(2);
  }

  function clearDistribution() {
    availableFees.value = [...feeOptions.value];
    feeDistribution.value = [];
    newTransaction.value.total_amount_paid = "";
  }

  function addAllFeesToDistribution() {
    if (availableFees.value.length === 0) return;

    availableFees.value.forEach(fee => {
      feeDistribution.value.push({
        fee_id: fee.value as number,
        fee_label: `${fee.category} (${fee.studentId})`,
        original_amount: fee.amount,
        distributed_amount: 0,
        balance: fee.balance,
        _category: fee.category
      });
    });

    availableFees.value = [];

    const totalAmount = parseFloat(newTransaction.value.total_amount_paid) || 0;
    if (totalAmount > 0) {
      autoDistributeEvenly();
    }
  }

  async function triggerStudentSearch() {
    const searchTerm = newTransaction.value.studentSearch.trim();
    if (searchTerm.length >= 2) {
      await searchStudents(searchTerm);
    } else {
      students.value = [];
    }
  }

  async function initialize() {
    try {
      if (allStudents.value.length === 0) {
        await loadAllStudents();
      }
      await fetchTransactions(1);
    } catch (error) {
      console.error("Error initializing store:", error);
    }
  }

  return {
    // State
    allTransactions,
    searchQuery,
    activeFilter,
    paymentSubmissionFilter,
    isCreateTransactionDialogOpen,
    isViewTransactionDialogOpen,
    selectedTransaction,
    isLoadingFeeDetails,
    isLoading,
    currentPage,
    itemsPerPage,
    totalItems, // Make sure this is included
    perPage, // Make sure this is included
    newTransaction,
    students,
    selectedStudent,
    isLoadingStudents,
    feeOptions,
    isLoadingFees,
    feeDistribution,
    availableFees,
    allStudents,

    // Computed
    transactionsWithCorrectedNames,
    filteredTransactions,
    paginatedTransactions,
    totalPages, // This is computed, not state
    transactionStats,
    distributionStats,

    // Actions
    fetchTransactions,
    searchStudents,
    loadAllStudents,
    getStudentDisplayName,
    selectStudent,
    clearSelectedStudent,
    loadStudentFees,
    addFeeToDistribution,
    removeFeeFromDistribution,
    updateFeeDistribution,
    updateDistributedAmount,
    handleCreateTransaction,
    resetForm,
    showDialog,
    hideDialog,
    handleSearch,
    handleFilterChange,
    handlePaymentSubmissionFilterChange,
    goToPage,
    autoDistributeEvenly,
    autoDistributeProportionally,
    clearDistribution,
    addAllFeesToDistribution,
    triggerStudentSearch,
    initialize
  }
})