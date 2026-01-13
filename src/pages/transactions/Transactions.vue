<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue"
import {
  Plus,
  Search,
  CheckCircle,
  Clock,
  Send,
  XCircle,
  CreditCard,
  Eye,
  Trash2,
  Loader2,
  AlertCircle,
  CheckSquare,
  XSquare,
  User,
  PlusCircle,
  MinusCircle,
  X,
  ChevronRight,
  Info,
} from "lucide-vue-next"
import type {
  Transaction,
  TransactionStatus,
  FeeDropdownOption,
  PaymentSubmissionStatus
} from "@/services/api/transactions_api.ts"
import transactionsApi from "@/services/api/transactions_api.ts"
import apiService from "@/services/apiService.ts"

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

interface StudentApiResponse {
  current_page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
  data: Student[];  
  next: string | null;
  previous: string | null;
}

const transactions = ref<Transaction[]>([])
const searchQuery = ref("")
const activeFilter = ref<"all" | TransactionStatus>("all")
const paymentSubmissionFilter = ref<"all" | PaymentSubmissionStatus>("all")
const isCreateTransactionDialogOpen = ref(false)
const isViewTransactionDialogOpen = ref(false)
const selectedTransaction = ref<Transaction | null>(null)
const isLoadingFeeDetails = ref(false)

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

const isLoading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const itemsPerPage = 10

let searchDebounceTimer: ReturnType<typeof setTimeout>;
  
const rateLimiter = {
  lastCallTime: 0,
  minInterval: 2000, 
  delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
  async waitIfNeeded() {
    const now = Date.now();
    const timeSinceLastCall = now - this.lastCallTime;
    
    if (timeSinceLastCall < this.minInterval) {
      const waitTime = this.minInterval - timeSinceLastCall;
      console.log(`Rate limiting: waiting ${waitTime}ms before next student load`);
      await this.delay(waitTime);
    }
    
    this.lastCallTime = Date.now();
  }
};

async function triggerStudentSearch() {
  const searchTerm = newTransaction.value.studentSearch.trim()
  if (searchTerm.length >= 2) {
    await searchStudents(searchTerm)
  } else {
    alert("Please enter at least 2 characters to search")
  }
}

onMounted(async () => {
  console.log("Initializing page...")
  
   await new Promise(resolve => setTimeout(resolve, 500));
  await fetchTransactions()
  
  setTimeout(async () => {
    await loadAllStudents()
    
    if (allStudents.value.length > 0 && transactions.value.length > 0) {
      console.log("Updating transaction names after student load...")
      transactions.value = [...transactions.value]
    }
  }, 1000) 

watch(isCreateTransactionDialogOpen, async (isOpen) => {
  if (isOpen) {
    await loadStudents()
  } else {
    resetForm()
  }
})})

watch(() => newTransaction.value.studentSearch, async (searchTerm) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  if (searchTerm && searchTerm.trim().length >= 2) {
    searchDebounceTimer = setTimeout(async () => {
      await searchStudents(searchTerm.trim())
    }, 300)
  } else if (!searchTerm || searchTerm.trim().length === 0) {
    await loadStudents()
  }
})

watch(selectedStudent, async (student) => {
  if (student) {
    newTransaction.value.student_id = student.id
    await loadStudentFees(student.id)
  } else {
    newTransaction.value.student_id = null
    feeOptions.value = []
    feeDistribution.value = []
    availableFees.value = []
  }
})

watch(() => newTransaction.value.total_amount_paid, (totalAmount) => {
  const total = parseFloat(totalAmount) || 0
  updateFeeDistribution(total)
})
async function fetchTransactions(page: number = 1) {
  try {
    isLoading.value = true
    const response = await transactionsApi.getAll({
      current_page: page,
      per_page: itemsPerPage,
      search: searchQuery.value || undefined,
      status: activeFilter.value !== "all" ? activeFilter.value : undefined,
      payment_submission_status: paymentSubmissionFilter.value !== "all" ? paymentSubmissionFilter.value : undefined,
    })

    console.log("Transactions API Response:", response)

    if (response.data) {
      transactions.value = response.data.data
      console.log("First transaction sample:", transactions.value[0])
      console.log("All transactions:", transactions.value.map(t => ({
        id: t.id,
        student: t.student,
        studentId: t.studentId
      })))

      currentPage.value = response.data.current_page
      totalPages.value = response.data.total_pages
    }
  } catch (error) {
    console.error("Error fetching transactions:", error)
  } finally {
    isLoading.value = false
  }
}

const studentCurrentPage = ref(1)
const studentTotalPages = ref(1)
const studentTotalItems = ref(0)
const allStudents = ref<Student[]>([])
const isInitialLoadComplete = ref(false)

async function loadStudents() {
  try {
    isLoadingStudents.value = true

    const response = await apiService.get<StudentApiResponse>(`/api/v1/students/`, {
      params: {
        current_page: 1,
        per_page: 1000,
        s_status: 'enrolled',
        ordering: 's_studentID'
      }
    })

    if (response && response.data) {
      let studentData: Student[] = []

      if (Array.isArray(response.data)) {
        studentData = response.data
      } else if (response.data.data && Array.isArray(response.data.data)) {
        studentData = response.data.data
      }

      allStudents.value = studentData
      isInitialLoadComplete.value = true

      applySearchFilter()
    }

  } catch (error) {
    console.error("Error loading students:", error)
  } finally {
    isLoadingStudents.value = false
  }
}

function applySearchFilter() {
  const searchTerm = newTransaction.value.studentSearch.trim().toLowerCase()

  if (!searchTerm || searchTerm.length < 2) {
    students.value = []
    return
  }

  students.value = allStudents.value.filter(student => {
    const fullName = `${student.s_fname || ''} ${student.s_mname || ''} ${student.s_lname || ''} ${student.s_suffix || ''}`.toLowerCase()
    return (
      fullName.includes(searchTerm) ||
      (student.s_studentID?.toLowerCase() || '').includes(searchTerm) ||
      (student.s_email?.toLowerCase() || '').includes(searchTerm)
    )
  })
}

watch(() => newTransaction.value.studentSearch, () => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  searchDebounceTimer = setTimeout(() => {
    if (isInitialLoadComplete.value) {
      applySearchFilter()
    } else {
      const searchTerm = newTransaction.value.studentSearch.trim()
      if (searchTerm.length >= 2) {
        searchStudents(searchTerm)
      }
    }
  }, 300)
})

async function searchStudents(searchTerm: string) {
  try {
    await rateLimiter.waitIfNeeded();

    isLoadingStudents.value = true
    studentCurrentPage.value = 1

    const searchLower = searchTerm.toLowerCase().trim()
    console.log("Searching for student with term:", searchLower)

    if (allStudents.value.length === 0) {
      await loadAllStudents()
    }

    const filteredStudents = allStudents.value.filter(student => {
      const fullName = `${student.s_fname || ''} ${student.s_mname || ''} ${student.s_lname || ''}`.toLowerCase()
      const withSuffix = student.s_suffix ? `${fullName} ${student.s_suffix.toLowerCase()}` : fullName

      return (
        fullName.includes(searchLower) ||
        withSuffix.includes(searchLower) ||
        (student.s_studentID?.toLowerCase() || '').includes(searchLower) ||
        (student.s_email?.toLowerCase() || '').includes(searchLower)
      )
    })

    students.value = filteredStudents
    console.log("Filtered students found:", students.value.length)

  } catch (error: any) {
    console.error("Error searching students:", error)
    alert(`Error searching students: ${error.message}`)
    students.value = []
  } finally {
    isLoadingStudents.value = false
  }
}

async function loadAllStudents() {
  try {
    await rateLimiter.waitIfNeeded();
    
    console.log("Loading all students...");
    
    const response = await apiService.get<StudentApiResponse>(`/api/v1/students/`, {
      params: {
        current_page: 1,
        per_page: 1000, 
        s_status: 'enrolled',
        ordering: 's_studentID'
      }
    });
    
    console.log("Students API Response:", response)
    
    if (response && response.data) {
      const apiData = response.data.data
      
      if (apiData && apiData.data && Array.isArray(apiData.data)) {
        allStudents.value = apiData.data
        console.log("Loaded all students:", allStudents.value.length)
        console.log("Sample students:", allStudents.value.slice(0, 3).map(s => ({
          id: s.id,
          studentID: s.s_studentID,
          name: `${s.s_fname} ${s.s_lname}`
        })))
      } else if (Array.isArray(apiData)) {
        allStudents.value = apiData
        console.log("Loaded all students (direct array):", allStudents.value.length)
      } else {
        console.error("Unexpected students data format:", apiData)
        allStudents.value = []
      }
    } else {
      console.error("No students data in response")
      allStudents.value = []
    }
    
  } catch (error) {
    console.error("Error loading all students:", error)
    allStudents.value = []
  }
}

watch(() => newTransaction.value.studentSearch, async (searchTerm) => {
  if (searchDebounceTimer) {
    clearTimeout(searchDebounceTimer)
  }

  const trimmedTerm = searchTerm?.trim() || ''

  if (trimmedTerm.length >= 2) {
    searchDebounceTimer = setTimeout(async () => {
      await searchStudents(trimmedTerm)
    }, 300)
  } else if (trimmedTerm.length === 0) {
    students.value = []
  }
})

function getStudentDisplayName(student: Student): string {
  if (!student) return "Unknown Student"

  const name = `${student.s_fname || ''} ${student.s_mname || ''} ${student.s_lname || ''} ${student.s_suffix || ''}`.trim()
  const studentId = student.s_studentID || `ID-${student.id}`

  return `${studentId} - ${name}`
}

function selectStudent(student: Student) {
  selectedStudent.value = student
  newTransaction.value.studentSearch = getStudentDisplayName(student)
}

function clearSelectedStudent() {
  selectedStudent.value = null
  newTransaction.value.studentSearch = ""
  students.value = []
  feeOptions.value = []
  feeDistribution.value = []
  availableFees.value = []
}

async function loadStudentFees(studentId: number) {
  try {
    isLoadingFees.value = true;
    isLoadingFeeDetails.value = true;
    
    console.log(`=== Loading fees for student ${studentId} ===`);
    
    const feeOptionsFromApi = await transactionsApi.getFees({
      student_id: studentId.toString(),
      per_page: 100,
      status: ['pending', 'partial', 'overdue'], 
    });

    console.log(`Loaded ${feeOptionsFromApi.length} fees`);
    
    if (feeOptionsFromApi.length > 0) {
      const categories = feeOptionsFromApi.reduce((acc, fee) => {
        acc[fee.category] = (acc[fee.category] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      console.log("Categories distribution:", categories);
      
      feeOptionsFromApi.slice(0, 3).forEach((fee, i) => {
        console.log(`Fee ${i + 1}:`, {
          value: fee.value,
          category: fee.category,
          category_id: fee.category_id,
          amount: fee.amount,
          studentName: fee.studentName
        });
      });
    }
    
    feeOptions.value = feeOptionsFromApi;
    availableFees.value = [...feeOptionsFromApi];
    feeDistribution.value = [];

  } catch (error) {
    console.error("Error loading fees:", error);
  } finally {
    isLoadingFees.value = false;
    isLoadingFeeDetails.value = false;
  }
}

async function getCategoryNameById(categoryId: number): Promise<string> {
  try {
    if (!categoryId) return 'Others'
    
    const response = await apiService.get(`/api/v1/collection-categories/${categoryId}/`)
    
    if (response.data && response.data.name) {
      return response.data.name
    }
    
    return 'Others'
  } catch (error) {
    console.error(`Error fetching category ${categoryId}:`, error)
    return 'Others'
  }
}

function addFeeToDistribution(feeId: number) {
  if (isLoadingFeeDetails.value) {
    console.log("Still loading fee details, please wait...")
    return
  }

  const feeIndex = availableFees.value.findIndex(f => f.value === feeId)
  if (feeIndex === -1) {
    console.warn("Fee not found in available fees:", feeId)
    return
  }

  const fee = availableFees.value[feeIndex]
  
  console.log("DEBUG - Fee object structure:", {
    value: fee.value,
    id: fee.id,
    fee_id: fee.fee_id,
    amount: fee.amount,
    balance: fee.balance,
    feeData: fee.feeData,
    fullObject: fee
  })
  
  const categoryName = fee.category || 'Unknown Category'
  

  const actualFeeId = fee.id || fee.fee_id || fee.value || fee.feeData?.id
  
  console.log("DEBUG - Determined actual fee ID:", actualFeeId)
  
  if (!actualFeeId || isNaN(actualFeeId) || actualFeeId <= 0) {
    console.error("Invalid fee ID found:", actualFeeId, "for fee:", fee)
    alert(`Cannot add fee "${categoryName}" - invalid fee ID. Please try again.`)
    return
  }
  
  const feeBalance = fee.balance !== undefined ? fee.balance : fee.amount;

  feeDistribution.value.push({
    fee_id: actualFeeId, 
    fee_label: `${categoryName} (${fee.studentId || 'N/A'})`,
    original_amount: fee.amount,
    distributed_amount: 0,
    balance: feeBalance, 
    _category: categoryName 
  })


  availableFees.value.splice(feeIndex, 1)
  
  const totalAmount = parseFloat(newTransaction.value.total_amount_paid) || 0
  if (totalAmount > 0) {
    updateFeeDistribution(totalAmount)
  }
  
  console.log("Added fee to distribution. Current distribution:", feeDistribution.value)
}

function removeFeeFromDistribution(index: number) {
  if (index < 0 || index >= feeDistribution.value.length) return
  
  const removedFee = feeDistribution.value[index]
  console.log("Removing fee from distribution:", removedFee)
  
  const originalFee = feeOptions.value.find(f => f.value === removedFee.fee_id)
  
  if (originalFee) {
    availableFees.value.push(originalFee)
  }
  
  feeDistribution.value.splice(index, 1)
  
  const total = parseFloat(newTransaction.value.total_amount_paid) || 0
  updateFeeDistribution(total)
  
  console.log("After removal - Available:", availableFees.value, "Distribution:", feeDistribution.value)
}

function updateFeeDistribution(totalAmount: number) {
  if (feeDistribution.value.length === 0) return

  let remainingAmount = totalAmount
  
  const totalBalance = feeDistribution.value.reduce((sum, fee) => sum + fee.balance, 0)

  if (totalAmount < totalBalance) {
    feeDistribution.value.forEach(fee => {
      const proportion = fee.balance / totalBalance
      fee.distributed_amount = Math.min(fee.balance, proportion * totalAmount)
      fee.balance = fee.balance - fee.distributed_amount
      remainingAmount -= fee.distributed_amount
    })
  } else {
    feeDistribution.value.forEach(fee => {
      fee.distributed_amount = fee.balance
      fee.balance = 0
      remainingAmount -= fee.balance
    })
  }

  if (remainingAmount > 0 && feeDistribution.value.length > 0) {
    feeDistribution.value[0].distributed_amount += remainingAmount
    feeDistribution.value[0].balance = Math.max(0, feeDistribution.value[0].original_amount - feeDistribution.value[0].distributed_amount)
  }
  
  distributionStats.value.totalOriginal = feeDistribution.value.reduce((sum, fee) => sum + fee.original_amount, 0)
  distributionStats.value.totalDistributed = feeDistribution.value.reduce((sum, fee) => sum + fee.distributed_amount, 0)
  distributionStats.value.totalBalance = feeDistribution.value.reduce((sum, fee) => sum + fee.balance, 0)
}

function updateDistributedAmount(index: number, amount: number) {
  const fee = feeDistribution.value[index]
  
  const maxAmount = fee.balance

  amount = Math.max(0, Math.min(amount, maxAmount))

  fee.distributed_amount = amount
  fee.balance = fee.original_amount - fee.distributed_amount

  const newTotal = feeDistribution.value.reduce((sum, f) => sum + f.distributed_amount, 0)
  newTransaction.value.total_amount_paid = newTotal.toFixed(2)
  
  distributionStats.value.totalDistributed = newTotal
  distributionStats.value.totalBalance = feeDistribution.value.reduce((sum, f) => sum + f.balance, 0)
}
async function handleCreateTransaction() {
  if (!selectedStudent.value || feeDistribution.value.length === 0 || !newTransaction.value.total_amount_paid) {
    alert("Please select a student, add at least one fee to pay, and enter total amount")
    return
  }
  
  const totalAmount = parseFloat(newTransaction.value.total_amount_paid)
  if (totalAmount <= 0) {
    alert("Please enter a valid amount greater than 0")
    return
  }

  const totalDistributed = feeDistribution.value.reduce((sum, fee) => sum + fee.distributed_amount, 0)
  if (Math.abs(totalDistributed - totalAmount) > 0.01) {
    alert("Distributed amount doesn't match total amount")
    return
  }

  try {
    console.log("=== Creating payments and updating fee balances ===")
    
    const successfulPayments = [];
    const failedPayments = [];
    
    for (const [index, feeDist] of feeDistribution.value.filter(f => f.distributed_amount > 0).entries()) {
      try {
        console.log(`Processing fee ${index + 1} of ${feeDistribution.value.length}...`);
        
        if (index > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        const feeId = feeDist.fee_id;
        
        if (!feeId || feeId <= 0 || isNaN(feeId)) {
          throw new Error(`Invalid fee ID: ${feeId} for fee: ${feeDist.fee_label}`);
        }
        
        console.log(`Using fee ID: ${feeId} for: ${feeDist.fee_label}`);
        
        // Step 1: Get current fee balance
        console.log(`Getting current fee balance for fee ID ${feeId}...`);
        const feeResponse = await apiService.get(`/api/v1/fees/${feeId}/`);
        const currentFee = feeResponse.data;
        
        if (!currentFee) {
          throw new Error(`Could not fetch fee ${feeId} details`);
        }
        
        const currentBalance = parseFloat(currentFee.balance || "0");
        const paymentAmount = feeDist.distributed_amount;
        
        console.log(`Current balance: ${currentBalance}, Payment amount: ${paymentAmount}`);
        
        // Step 2: Create the payment
        const paymentData = {
          fee: feeId,
          amount_paid: paymentAmount.toFixed(2),
          payment_method: newTransaction.value.payment_method,
          payment_submission: null
        };
        
        console.log("Creating payment with data:", paymentData);
        
        const paymentResponse = await apiService.post('/api/v1/payments/', paymentData);
        console.log("Payment created:", paymentResponse.data);
        
        if (!paymentResponse.data) {
          throw new Error("Payment creation failed - no response data");
        }
        
        // Step 3: Update fee balance (deduct amount paid)
        const newBalance = currentBalance - paymentAmount;
        const newStatus = newBalance <= 0 ? 'paid' : 
                         (paymentAmount > 0 ? 'partial' : currentFee.status);
        
        const feeUpdateData = {
          balance: Math.max(0, newBalance).toFixed(2), 
          status: newStatus
        };
        
        console.log(`Updating fee ${feeId} balance: ${currentBalance} → ${newBalance}, status: ${newStatus}`);
        
        const updateResponse = await apiService.patch(`/api/v1/fees/${feeId}/`, feeUpdateData);
        console.log("Fee updated:", updateResponse.data);
        
        successfulPayments.push({
          fee: feeDist,
          payment: paymentResponse.data,
          updatedFee: updateResponse.data
        });
        
      } catch (error: any) {
        console.error(`Error processing fee:`, error);
        
        let errorMessage = "Unknown error";
        if (error.response?.data) {
          try {
            errorMessage = JSON.stringify(error.response.data);
          } catch {
            errorMessage = error.response.statusText || "Server error";
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        failedPayments.push({
          fee: feeDist,
          error: errorMessage
        });
      }
    }
    
    console.log("Payment creation results:", {
      successful: successfulPayments.length,
      failed: failedPayments.length
    });
    
    if (failedPayments.length > 0) {
      const errorList = failedPayments.map(fp => 
        `${fp.fee.fee_label}: ${fp.error}`
      ).join('\n');
      
      if (successfulPayments.length === 0) {
        alert(`All payments failed:\n\n${errorList}`);
        return;
      } else {
        const result = confirm(
          `${successfulPayments.length} payment(s) succeeded, but ${failedPayments.length} failed.\n\n` +
          `Failed:\n${errorList}\n\n` +
          `Do you want to continue with successful payments?`
        );
        
        if (!result) {
          return;
        }
      }
    }
    
    if (successfulPayments.length > 0) {
      isCreateTransactionDialogOpen.value = false
      resetForm()
      alert(`Successfully created ${successfulPayments.length} payment(s) and updated fee balances!`)
      await fetchTransactions(1)
    } else {
      alert("No payments were created.");
    }

  } catch (error: any) {
    console.error("Unexpected error in handleCreateTransaction:", error);
    alert(`Unexpected error: ${error.message || "Please check console for details"}`);
  }
}

function resetForm() {
  newTransaction.value = {
    student_id: null,
    total_amount_paid: "",
    payment_method: "cash",
    studentSearch: ""
  }
  selectedStudent.value = null
  feeOptions.value = []
  availableFees.value = []
  feeDistribution.value = []
  students.value = []
}

const showDialog = (transaction: Transaction) => {
  selectedTransaction.value = transaction
  isViewTransactionDialogOpen.value = true
}

const hideDialog = () => {
  isViewTransactionDialogOpen.value = false
  selectedTransaction.value = null
}

// async function handleDelete(id: string) {
//   if (confirm("Are you sure you want to delete this transaction?")) {
//     try {
//       await transactionsApi.delete(id)
//       transactions.value = transactions.value.filter((t) => t.id !== id)
//       alert("Transaction deleted successfully")
//     } catch (error) {
//       console.error("Error deleting transaction:", error)
//       alert("Error deleting transaction")
//     }
//   }
// }

async function handleMarkAsPaid(id: string) {
  try {
    const paymentMethod = prompt("Enter payment method (cash, gcash, bank, online, other):", "cash")
    if (!paymentMethod) return

    const validMethods: Array<"cash" | "gcash" | "bank" | "online" | "other"> = ["cash", "gcash", "bank", "online", "other"]
    const method = validMethods.find(m => m === paymentMethod.toLowerCase()) as "cash" | "gcash" | "bank" | "online" | "other" | undefined

    if (!method) {
      alert("Invalid payment method. Please use: cash, gcash, bank, online, or other")
      return
    }

    const response = await transactionsApi.markAsPaid(id, method)
    if (response.data) {
      const index = transactions.value.findIndex(t => t.id === id)
      if (index !== -1) {
        transactions.value[index] = response.data
      }

      if (selectedTransaction.value?.id === id) {
        selectedTransaction.value = response.data
      }

      alert("Transaction marked as paid")
    }
  } catch (error) {
    console.error("Error marking transaction as paid:", error)
    alert("Error marking transaction as paid")
  }
}

async function updatePaymentSubmissionStatus(transactionId: string, status: PaymentSubmissionStatus, remarks?: string) {
  const transaction = transactions.value.find(t => t.id === transactionId)
  if (!transaction || !transaction.payment_submission_id) {
    alert("Cannot update status: No payment submission found")
    return
  }

  try {
    const response = await transactionsApi.updatePaymentSubmissionStatus(
      transaction.payment_submission_id,
      status,
      remarks
    )

    if (response.data) {
      const index = transactions.value.findIndex(t => t.id === transactionId)
      if (index !== -1) {
        transactions.value[index] = {
          ...transactions.value[index],
          paymentSubmissionStatus: status
        }
      }

      if (selectedTransaction.value?.id === transactionId) {
        selectedTransaction.value = {
          ...selectedTransaction.value,
          paymentSubmissionStatus: status
        }
      }

      alert(`Payment submission marked as ${status}`)
    }
  } catch (error) {
    console.error("Error updating payment submission status:", error)
    alert("Error updating payment submission status")
  }
}

async function approvePaymentSubmission(transactionId: string) {
  const remarks = prompt("Enter remarks (optional):")
  await updatePaymentSubmissionStatus(transactionId, "approved", remarks || undefined)
}

async function rejectPaymentSubmission(transactionId: string) {
  const remarks = prompt("Enter rejection reason (required):")
  if (!remarks) {
    alert("Rejection reason is required")
    return
  }
  await updatePaymentSubmissionStatus(transactionId, "rejected", remarks)
}

const transactionsWithCorrectedNames = computed(() => {
  console.log("Correcting transaction names...")
  console.log("All students available:", allStudents.value.length)
  
  if (allStudents.value.length === 0) {
    console.log("No students loaded yet, cannot correct names")
    return transactions.value
  }
  
  return transactions.value.map(transaction => {
    console.log(`Processing transaction ${transaction.id} with studentId: ${transaction.studentId}`)
    
    const student = allStudents.value.find(s => {
      if (s.s_studentID === transaction.studentId.toString()) {
        return true
      }
      
      if (s.id.toString() === transaction.studentId.toString()) {
        return true
      }
      
      return false
    })
    
    if (student) {
      const parts = [
        student.s_fname,
        student.s_mname,
        student.s_lname,
        student.s_suffix && student.s_suffix.trim() !== '' ? student.s_suffix : null
      ].filter(Boolean)
      
      const correctedName = parts.join(' ').trim()
      const originalName = transaction.student
      
      console.log(`Transaction ${transaction.id}:`, {
        studentId: transaction.studentId,
        originalName,
        correctedName,
        studentFound: `${student.s_fname} ${student.s_lname}`
      })
      
      return {
        ...transaction,
        student: correctedName,
        originalStudentName: originalName,
        _studentMatch: true
      }
    } else {
      console.warn(`No student found for transaction ${transaction.id} with studentId: ${transaction.studentId}`)
      console.log("Available student IDs:", allStudents.value.map(s => s.s_studentID))
      
      return {
        ...transaction,
        _studentMatch: false
      }
    }
  })
})

const filteredTransactions = computed(() =>
  transactionsWithCorrectedNames.value.filter((transaction) => {
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
)
const transactionStats = computed(() => {
  const sent = transactions.value.filter((i) => i.status === "sent")
  const paid = transactions.value.filter((i) => i.status === "paid")
  const overdue = transactions.value.filter((i) => i.status === "overdue")
  const pendingSubmissions = transactions.value.filter((i) => i.paymentSubmissionStatus === "pending").length
  const approvedSubmissions = transactions.value.filter((i) => i.paymentSubmissionStatus === "approved").length
  const rejectedSubmissions = transactions.value.filter((i) => i.paymentSubmissionStatus === "rejected").length

  return {
    sentCount: sent.length,
    paidCount: paid.length,
    overdueCount: overdue.length,
    pendingSubmissions,
    approvedSubmissions,
    rejectedSubmissions
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

let searchTimeout: NodeJS.Timeout
function handleSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchTransactions(1)
  }, 500)
}

function handleFilterChange() {
  fetchTransactions(1)
}

function handlePaymentSubmissionFilterChange() {
  fetchTransactions(1)
}

function autoDistributeEvenly() {
  if (feeDistribution.value.length === 0) return

  const totalAmount = parseFloat(newTransaction.value.total_amount_paid) || 0
  const perFeeAmount = totalAmount / feeDistribution.value.length

  feeDistribution.value.forEach((fee, index) => {
    const amount = index === feeDistribution.value.length - 1
      ? totalAmount - (perFeeAmount * (feeDistribution.value.length - 1))
      : perFeeAmount
    updateDistributedAmount(index, Math.min(amount, fee.balance))
  })
}


function autoDistributeProportionally() {
  if (feeDistribution.value.length === 0) return

  const totalAmount = parseFloat(newTransaction.value.total_amount_paid) || 0
  const totalBalance = feeDistribution.value.reduce((sum, fee) => sum + fee.balance, 0)

  feeDistribution.value.forEach((fee, index) => {
    const proportion = fee.balance / totalBalance
    const amount = proportion * totalAmount
    updateDistributedAmount(index, Math.min(amount, fee.balance))
  })
}

function clearDistribution() {
  console.log("Clearing distribution. Current feeOptions:", feeOptions.value)
  
  availableFees.value = [...feeOptions.value]
  
  feeDistribution.value = []
  
  newTransaction.value.total_amount_paid = ""
  
  console.log("After clear - Available:", availableFees.value.length, "Distribution:", feeDistribution.value.length)
}

function addAllFeesToDistribution() {
  if (availableFees.value.length === 0) return
  
  const feesToAdd = [...availableFees.value]
  
  feesToAdd.forEach(fee => {
    const categoryName = fee.category_name || fee.category || 'Unknown Category'
    
 
    const feeBalance = fee.balance !== undefined ? fee.balance : fee.amount;
    
    feeDistribution.value.push({
      fee_id: fee.value,
      fee_label: `${categoryName} (${fee.studentId || 'N/A'})`,
      original_amount: fee.amount,
      distributed_amount: 0,
      balance: feeBalance, 
      _category: categoryName
    })
  })
  
  availableFees.value = []
  
  const totalAmount = parseFloat(newTransaction.value.total_amount_paid) || 0
  if (totalAmount > 0) {
    autoDistributeEvenly()
  }
  
  console.log("Added all fees. Current distribution:", feeDistribution.value)
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <header class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 leading-tight">Transactions</h1>
        <p class="text-sm text-gray-500 mt-1">View and manage all financial transactions</p>
      </header>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        <!-- stats grid -->
        <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between h-full">
          <div>
            <div class="text-3xl font-bold">{{ transactionStats.sentCount }}</div>
            <p class="text-sm text-gray-500">Sent Transactions</p>
            <p class="text-xs text-gray-400">Awaiting payment</p>
          </div>
          <Send class="h-8 w-8 text-blue-500" />
        </div>

        <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between h-full">
          <div>
            <div class="text-3xl font-bold text-green-600">{{ transactionStats.paidCount }}</div>
            <p class="text-sm text-gray-500">Paid Transactions</p>
            <p class="text-xs text-gray-400">Completed</p>
          </div>
          <CheckCircle class="h-8 w-8 text-green-500" />
        </div>

        <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between h-full">
          <div>
            <div class="text-3xl font-bold text-red-600">{{ transactionStats.overdueCount }}</div>
            <p class="text-sm text-gray-500">Overdue</p>
            <p class="text-xs text-gray-400">Need attention</p>
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
              <span class="text-sm font-medium text-yellow-600">{{ transactionStats.pendingSubmissions }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Approved:</span>
              <span class="text-sm font-medium text-green-600">{{ transactionStats.approvedSubmissions }}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Rejected:</span>
              <span class="text-sm font-medium text-red-600">{{ transactionStats.rejectedSubmissions }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- main -->
      <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center justify-end mb-6">
          <button
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="isCreateTransactionDialogOpen = true">
            <Plus class="mr-2 h-4 w-4" />
            Create Payment
          </button>
        </div>

        <!-- search w/ filter -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input v-model="searchQuery" @input="handleSearch"
              class="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by student name, transaction number, or category..." />
          </div>
          <div class="flex gap-4">
            <div class="relative">
              <select v-model="activeFilter" @change="handleFilterChange"
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
              <select v-model="paymentSubmissionFilter" @change="handlePaymentSubmissionFilterChange"
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
        <div v-if="isLoading" class="text-center py-8">
          <Loader2 class="inline-block animate-spin rounded-full h-8 w-8 text-blue-600" />
          <p class="mt-2 text-gray-600">Loading transactions...</p>
        </div>

        <!-- table -->
        <div class="overflow-x-auto" v-else>
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Number</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Submission Status</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <!-- if empty -->
              <tr v-if="filteredTransactions.length === 0">
                <td colspan="9" class="px-6 py-12 text-center text-gray-500">
                  <CreditCard class="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p class="mb-2 text-gray-700">No transactions found</p>
                  <p class="text-sm text-gray-500">Create your first payment transaction to get started.</p>
                </td>
              </tr>
              <tr v-for="transaction in filteredTransactions" :key="transaction.id">
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
                    {{ new Date(transaction.dueDate).toLocaleDateString() }}
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
                    <button @click="showDialog(transaction)" class="text-blue-600 hover:text-blue-900 p-1"
                      title="View Details">
                      <Eye class="h-5 w-5" />
                    </button>
                    <button @click="handleMarkAsPaid(transaction.id)" v-if="transaction.status !== 'paid'"
                      class="text-green-600 hover:text-green-900 p-1" title="Mark as Paid">
                      <CheckCircle class="h-5 w-5" />
                    </button>
                    <button @click="approvePaymentSubmission(transaction.id)"
                      v-if="transaction.paymentSubmissionStatus === 'pending'"
                      class="text-green-600 hover:text-green-900 p-1" title="Approve Submission">
                      <CheckSquare class="h-5 w-5" />
                    </button>
                    <button @click="rejectPaymentSubmission(transaction.id)"
                      v-if="transaction.paymentSubmissionStatus === 'pending'"
                      class="text-red-600 hover:text-red-900 p-1" title="Reject Submission">
                      <XSquare class="h-5 w-5" />
                    </button>
                    <!-- <button @click="handleDelete(transaction.id)" class="text-red-600 hover:text-red-900 p-1"
                      title="Delete">
                      <Trash2 class="h-5 w-5" />
                    </button> -->
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- Pagination -->
          <div v-if="totalPages > 1"
            class="flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Page <span class="font-medium">{{ currentPage }}</span> of
                  <span class="font-medium">{{ totalPages }}</span>
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button @click="fetchTransactions(currentPage - 1)" :disabled="currentPage === 1"
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Previous
                  </button>
                  <button @click="fetchTransactions(currentPage + 1)" :disabled="currentPage === totalPages"
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    Next
                  </button>
                </nav>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Payment Dialog -->
    <div v-if="isCreateTransactionDialogOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">

      <div class="bg-white rounded-lg w-full max-w-4xl relative max-h-[90vh] overflow-y-auto">
        <!-- Header -->
        <div class="sticky top-0 bg-white border-b px-6 py-4 z-10">
          <div class="flex items-center justify-between">
            <h2 class="text-xl font-semibold text-gray-900">Create New Payment</h2>
            <button @click="isCreateTransactionDialogOpen = false"
              class="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded" title="Close">
              <X class="h-5 w-5" />
            </button>
          </div>
        </div>

        <div class="p-6">
          <form @submit.prevent="handleCreateTransaction" class="space-y-6">
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
                    <input v-model="newTransaction.studentSearch" @keyup.enter="triggerStudentSearch"
                      class="pl-10 w-full border border-gray-300 rounded-l-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Enter student ID, name, or email..." autocomplete="off" />
                    <Loader2 v-if="isLoadingStudents"
                      class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400" />
                  </div>
                  <button type="button" @click="triggerStudentSearch"
                    :disabled="isLoadingStudents || newTransaction.studentSearch.length < 2"
                    class="px-4 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center">
                    <Search class="h-4 w-4" />
                    <span class="ml-2 hidden sm:inline">Search</span>
                  </button>
                </div>
                <p class="mt-1 text-xs text-gray-500">Enter at least 2 characters and click Search</p>
              </div>

              <!-- Search Results -->
              <div v-if="!selectedStudent && newTransaction.studentSearch.length >= 2" class="mb-4">
                <!-- Loading State -->
                <div v-if="isLoadingStudents" class="p-4 text-center">
                  <Loader2 class="inline-block animate-spin h-6 w-6 text-blue-600" />
                  <p class="mt-2 text-sm text-gray-600">Searching students...</p>
                </div>

                <!-- Results Found -->
                <div v-else-if="students.length > 0" class="space-y-2">
                  <div class="flex items-center justify-between mb-2">
                    <span class="text-sm font-medium text-gray-700">
                      Found {{ students.length }} student{{ students.length !== 1 ? 's' : '' }} for "{{
                        newTransaction.studentSearch }}"
                    </span>
                    <span class="text-xs text-gray-500">
                      Click to select
                    </span>
                  </div>


                  <!-- Single Student Result -->
                  <div v-if="students.length === 1"
                    class="p-4 border border-blue-200 rounded-md bg-blue-50 hover:bg-blue-100 cursor-pointer transition-colors"
                    @click="selectStudent(students[0])">
                    <div class="flex items-center">
                      <User class="h-6 w-6 text-blue-600 mr-3" />
                      <div class="flex-1">
                        <div class="font-bold text-gray-900">{{ students[0].s_studentID }}</div>

                        <div class="text-sm text-gray-700">
                          {{ students[0].s_fname }}
                          {{ students[0].s_mname }}
                          {{ students[0].s_lname }}
                          <span v-if="students[0].s_suffix && students[0].s_suffix.trim() !== ''">
                            {{ students[0].s_suffix }}
                          </span>
                        </div>

                        <div class="text-xs text-gray-500 mt-1">
                          {{ students[0].s_email }}
                        </div>
                        <div v-if="students[0].program" class="text-xs text-blue-600 font-medium mt-1">
                          {{ students[0].program.name }}
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
                    <div v-for="student in students" :key="student.id"
                      class="p-3 border border-gray-200 rounded-md hover:bg-gray-50 cursor-pointer"
                      @click="selectStudent(student)">
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
                <div v-else-if="!isLoadingStudents"
                  class="p-4 text-center text-gray-500 border border-gray-200 rounded-md">
                  <AlertCircle class="mx-auto h-8 w-8 mb-2" />
                  <p>No students found for "{{ newTransaction.studentSearch }}"</p>
                  <p class="text-sm mt-1">Try a different search term</p>
                </div>
              </div>
              <!-- Selected Student -->
              <div v-if="selectedStudent" class="p-4 bg-green-50 border border-green-200 rounded-md">
                <div class="flex items-start justify-between">
                  <div>
                    <div class="flex items-center mb-2">
                      <CheckCircle class="h-5 w-5 text-green-600 mr-2" />
                      <span class="text-sm font-medium text-green-800">Selected Student</span>
                    </div>
                    <div class="text-sm font-bold">{{ selectedStudent.s_studentID }}</div>
                    <div class="text-sm text-gray-700">
                      {{ selectedStudent.s_fname }} {{ selectedStudent.s_mname }} {{ selectedStudent.s_lname }} {{
                        selectedStudent.s_suffix }}
                    </div>
                    <div class="text-xs text-gray-500 mt-1">
                      {{ selectedStudent.s_email }}
                    </div>
                    <div v-if="selectedStudent.program" class="text-xs text-blue-600 font-medium mt-1">
                      {{ selectedStudent.program.name }}
                    </div>
                  </div>
                  <button type="button" @click="clearSelectedStudent"
                    class="p-1 text-gray-400 hover:text-gray-600 hover:bg-white rounded" title="Change student">
                    <X class="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

  <!-- Step 2: Fees Selection -->
<div v-if="selectedStudent">
  <h3 class="text-lg font-medium text-gray-900 mb-4">2. Select Fees to Pay</h3>

  <!-- Overall Loading State -->
  <div v-if="isLoadingFees" class="text-center py-4">
    <Loader2 class="inline-block animate-spin h-6 w-6 text-blue-600" />
    <p class="mt-2 text-sm text-gray-600">Loading fees...</p>
  </div>

  <!-- Content loaded -->
  <div v-else>
    <!-- Available Fees -->
    <div v-if="availableFees.length > 0" class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <label class="text-sm font-medium text-gray-700 block">
            Available Fees ({{ availableFees.length }})
            <span v-if="isLoadingFeeDetails" class="ml-2 text-xs text-yellow-600">
              Loading categories...
            </span>
          </label>
          <p class="text-xs text-gray-500 mt-1">
            Click to add fees to payment.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div v-for="fee in availableFees" :key="fee.value"
             @click="addFeeToDistribution(fee.value)"
             class="p-4 border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 cursor-pointer transition-all duration-200">
          <div class="flex items-center justify-between">
            <div class="flex-1">
              <div class="font-medium text-gray-900">
                {{ fee.category }}
                <span v-if="fee.category_id" class="text-xs text-gray-400 ml-2">
                  (ID: {{ fee.category_id }})
                </span>
              </div>
              <div class="text-xs text-gray-500 mt-1">
                Amount: ₱{{ fee.amount.toLocaleString() }}
                <span v-if="fee.balance !== fee.amount" class="ml-2 text-orange-600">
                  Balance: ₱{{ fee.balance.toLocaleString() }}
                </span>
              </div>
              <div class="text-xs text-gray-400 mt-1">
                Student: {{ fee.studentName }}
                <span class="ml-2">Due: {{ fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : 'N/A' }}</span>
              </div>
            </div>
            <div class="ml-2">
              <PlusCircle class="h-5 w-5 text-blue-600" />
              <div class="text-xs text-gray-400 mt-1 text-center">
                Fee ID: {{ fee.value }}
              </div>
            </div>
          </div>
          
          <!-- Debug info -->
          <div v-if="fee.category === 'Others' && fee.category_id" 
               class="text-xs text-yellow-600 mt-2 p-1 bg-yellow-50 rounded">
            Category name not loaded (ID: {{ fee.category_id }})
          </div>
        </div>
      </div>
    </div>

    <!-- Loading state -->
    <div v-else-if="isLoadingFeeDetails" class="mb-6">
      <div class="p-6 text-center border border-gray-200 rounded-lg bg-gray-50">
        <Loader2 class="inline-block animate-spin h-8 w-8 text-blue-600 mb-4" />
        <p class="text-sm font-medium text-gray-700 mb-2">Loading categories...</p>
        <p class="text-xs text-gray-500">Fetching category information</p>
      </div>
    </div>

    <!-- No fees -->
    <div v-else-if="availableFees.length === 0" class="mb-6">
      <div class="p-4 text-center border border-gray-200 rounded-lg bg-gray-50">
        <Info class="h-6 w-6 text-gray-400 mx-auto mb-2" />
        <p class="text-sm text-gray-600">No pending fees found for this student.</p>
      </div>
    </div>

    <!-- Selected Fees Section -->
    <div v-if="feeDistribution.length > 0" class="mb-6">
      <div class="flex items-center justify-between mb-4">
        <div>
          <h4 class="text-md font-medium text-gray-900">Selected Fees ({{ feeDistribution.length }})</h4>
          <p class="text-xs text-gray-500 mt-1">
            Set payment amount for each fee.
          </p>
        </div>
        <div class="flex gap-2">
          <!-- <button type="button" 
                  @click="autoDistributeEvenly" 
                  :disabled="distributionStats.inputAmount <= 0"
                  class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
            Distribute Evenly
          </button> -->
          <button type="button" 
                  @click="autoDistributeProportionally" 
                  :disabled="distributionStats.inputAmount <= 0"
                  class="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed">
            Distribute by Amount
          </button>
          <button type="button" 
                  @click="clearDistribution" 
                  class="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200">
            Clear All
          </button>
        </div>
      </div>

      <!-- Progress Summary -->
     <div class="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
  <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-center place-items-center">
    <div>
      <div class="text-xs text-gray-500 mb-1">Total Fees</div>
      <div class="text-lg font-bold text-gray-900">
        ₱{{ distributionStats.totalOriginal.toLocaleString() }}
      </div>
    </div>

    <div>
      <div class="text-xs text-gray-500 mb-1">Balance to Pay</div>
      <div class="text-lg font-bold text-blue-600">
        ₱{{ distributionStats.totalBalance.toLocaleString() }}
      </div>
    </div>

    <div>
      <div class="text-xs text-gray-500 mb-1">Total Payment</div>
      <div
        class="text-lg font-bold"
        :class="{
          'text-green-600':
            Math.abs(
              distributionStats.inputAmount -
                distributionStats.totalDistributed
            ) < 0.01,
        }"
      >
        ₱{{ distributionStats.inputAmount.toLocaleString() }}
      </div>
    </div>
  </div>
</div>


      <!-- Fee List -->
      <div class="space-y-4">
        <div v-for="(fee, index) in feeDistribution" :key="fee.fee_id"
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
                  <input 
                    type="number" 
                    :value="fee.distributed_amount"
                    @input="updateDistributedAmount(index, parseFloat($event.target.value) || 0)"
                    min="0" 
                    :max="fee.original_amount"
                    step="0.01"
                    :readonly="distributionStats.inputAmount <= 0"
                    :class="[
                      'pl-8 w-full border rounded-md py-2 px-3 focus:outline-none focus:ring-2',
                      distributionStats.inputAmount <= 0 
                        ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed' 
                        : 'border-gray-300 focus:ring-blue-500 focus:border-transparent'
                    ]"
                    placeholder="0.00" 
                  />
                  <div v-if="distributionStats.inputAmount <= 0" 
                       class="absolute inset-0 bg-gray-50 opacity-50 rounded-md cursor-not-allowed"></div>
                </div>
                <div class="text-xs text-gray-500">
                  Original: ₱{{ fee.original_amount.toLocaleString() }} | 
                  Balance: ₱{{ fee.balance.toLocaleString() }}
                </div>
                <div v-if="distributionStats.inputAmount <= 0" 
                     class="text-xs text-yellow-600 mt-1">
                  ⓘ Enter a total amount below to enable fee distribution
                </div>
              </div>
            </div>
            
            <button type="button" 
                    @click="removeFeeFromDistribution(index)"
                    class="ml-4 p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-full"
                    title="Remove">
              <MinusCircle class="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
            <!-- Step 3: Payment Details -->
            <div v-if="selectedStudent && feeDistribution.length > 0">
              <h3 class="text-lg font-medium text-gray-900 mb-4">3. Payment Details</h3>

              <div class="space-y-4">
                <!-- Total Amount -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Total Amount (₱)
                  </label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                    <input v-model="newTransaction.total_amount_paid" type="number" min="0" step="0.01"
                      class="pl-8 w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00" required />
                  </div>
                </div>

                <!-- Payment Method -->
                <div>
                  <label class="block text-sm font-medium text-gray-700 mb-2">
                    Payment Method
                  </label>
                  <select v-model="newTransaction.payment_method"
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
                      <span>{{ selectedStudent.s_fname }} {{ selectedStudent.s_lname }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Fees:</span>
                      <span>{{ feeDistribution.length }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="text-gray-600">Amount:</span>
                      <span class="font-medium">₱{{ newTransaction.total_amount_paid || '0.00' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Action Buttons -->
                <div class="flex justify-end gap-3 pt-4">
                  <button type="button"
                    class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    @click="isCreateTransactionDialogOpen = false">
                    Cancel
                  </button>
                  <button type="submit"
                    :disabled="!newTransaction.total_amount_paid || parseFloat(newTransaction.total_amount_paid) <= 0"
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
    <div v-if="isViewTransactionDialogOpen" class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-bold text-gray-800">Transaction Details</h2>
          <button @click="hideDialog" class="text-gray-400 hover:text-gray-600">
            <X class="h-5 w-5" />
          </button>
        </div>


      </div>
    </div>
  </div>
</template>