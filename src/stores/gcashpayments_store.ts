// src/stores/gcashpayments_store.ts
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Ref } from 'vue'
import type {
  PaymentApproval,
  GcashPaymentSubmission,
  Student,
  StudentFee,
  FeesSummary,
  PaginatedResponse,
  ApiResponse
} from '@core/types'

// API Service - Make sure this path is correct
import gcashpayments_api, { studentApi } from '@services/api/gcashpayments_api'
export const useGcashpaymentsStore = defineStore('gcashpayments', () => {
  // State
  const gcashPayments: Ref<PaymentApproval[]> = ref([])
  const selectedPayment = ref<PaymentApproval | null>(null)
  const currentPage = ref(1)
  const perPage = ref(5)
  const searchQuery = ref('')
  const activeFilter = ref<'all' | PaymentApproval['priority']>('all')
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const isApproveModalOpen = ref(false)
  const isRejectModalOpen = ref(false)
  const rejectionReason = ref('')
  
  // Student state
  const currentStudent = ref<Student | null>(null)
  const studentFees = ref<StudentFee[]>([])
  const studentFeesSummary = ref<FeesSummary | null>(null)
  const isStudentLoading = ref(false)
  const studentError = ref<string | null>(null)

  // Computed
  const stats = computed(() => {
    const highPriority = gcashPayments.value.filter((p) => p.priority === 'high')
    const totalAmount = gcashPayments.value.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0)
    const averageAmount = gcashPayments.value.length > 0 ? totalAmount / gcashPayments.value.length : 0
    
    return {
      pendingApprovals: gcashPayments.value.length,
      highPriorityCount: highPriority.length,
      totalAmount,
      averageAmount
    }
  })

  const filteredPayments = computed(() => {
    const q = searchQuery.value.toLowerCase()
    
    return gcashPayments.value
      .filter(p => {
        const matchesSearch =
          (p.name?.toLowerCase().includes(q) || false) ||
          (p.studentId?.toLowerCase().includes(q) || false) ||
          p.reference_number.toLowerCase().includes(q) ||
          (p.feeType?.toLowerCase().includes(q) || false)
        
        const matchesFilter =
          activeFilter.value === 'all' || p.priority === activeFilter.value
        
        return matchesSearch && matchesFilter
      })
      .sort((a, b) => {
        if (a.priority === 'high' && b.priority !== 'high') return -1
        if (a.priority !== 'high' && b.priority === 'high') return 1
        return 0
      })
  })

  const totalPages = computed(() => {
    return Math.ceil(filteredPayments.value.length / perPage.value)
  })

  const paginatedPayments = computed(() => {
    const start = (currentPage.value - 1) * perPage.value
    const end = start + perPage.value
    return filteredPayments.value.slice(start, end)
  })

  // Helper function to calculate days ago
  const calculateDaysAgo = (dateString: string): number => {
    const created = new Date(dateString)
    const now = new Date()
    const diffTime = Math.abs(now.getTime() - created.getTime())
    return Math.floor(diffTime / (1000 * 60 * 60 * 24))
  }

  // Helper function to determine priority
  const determinePriority = (payment: GcashPaymentSubmission): 'high' | 'medium' | 'low' => {
    const amount = parseFloat(payment.amount_paid)
    const daysAgo = calculateDaysAgo(payment.created_at)
    
    if (amount > 5000 || daysAgo > 7) return 'high'
    if (amount > 1000 || daysAgo > 3) return 'medium'
    return 'low'
  }

  // Transform API data to PaymentApproval
  const transformPaymentData = async (
    payment: GcashPaymentSubmission,
    studentData?: Student,
    feeData?: StudentFee
  ): Promise<PaymentApproval> => {
    // Fetch student data if not provided
    let student = studentData
    if (!student && payment.student) {
      try {
        const response = await studentApi.getStudent(payment.student)
        if (response.data) {
          student = response.data
        }
      } catch (err) {
        console.error('Error fetching student data:', err)
      }
    }

    // Fetch fee data if not provided
    let fee = feeData
    if (!fee && payment.fee) {
      try {
        const fees = await studentApi.getStudentFees(payment.student)
        fee = fees.data.find((f: StudentFee) => f.id === payment.fee)
      } catch (err) {
        console.error('Error fetching fee data:', err)
      }
    }

    const fullName = student 
      ? `${student.s_fname} ${student.s_mname || ''} ${student.s_lname} ${student.s_suffix || ''}`.trim()
      : `Student ID: ${payment.student}`

    return {
      ...payment,
      name: fullName,
      studentId: student?.s_studentID || '',
      feeType: fee?.category?.category_name || 'Unknown Fee',
      daysAgo: calculateDaysAgo(payment.created_at),
      sender: fullName, // Assuming sender is the student
      description: fee?.category?.description || 'Payment Submission',
      priority: determinePriority(payment),
      notes: payment.remarks || undefined
    }
  }

  // Actions
// src/stores/gcashpayments_store.ts
const fetchGcashPayments = async (params?: {
  current_page?: number
  per_page?: number
  search?: string
  ordering?: string
  student__id?: number
}) => {
  isLoading.value = true
  error.value = null
  
  try {
    const defaultParams = {
      current_page: currentPage.value,
      per_page: 100,
      search: searchQuery.value,
      ordering: '-created_at',
      ...params
    }

    console.log('Fetching with params:', defaultParams);
    
    const response = await gcashpayments_api.getPaymentSubmissions(defaultParams)
    
    // Always ensure gcashPayments is an array
    gcashPayments.value = response.results || []
    
    console.log(`Successfully fetched ${gcashPayments.value.length} payments`);
    
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch GCash payments'
    console.error('Error fetching GCash payments:', err)
    // Ensure we have an empty array even on error
    gcashPayments.value = []
  } finally {
    isLoading.value = false
  }
}

// 

const fetchStudentProfile = async (studentId: number) => {
  isStudentLoading.value = true
  studentError.value = null
  
  try {
    const profile = await gcashpayments_api.getStudentProfile(studentId)
    
    currentStudent.value = profile.student
    studentFees.value = profile.fees
    studentFeesSummary.value = profile.summary
    
  } catch (err: any) {
    studentError.value = err.message || 'Failed to fetch student data'
    console.error('Error fetching student data:', err)
  } finally {
    isStudentLoading.value = false
  }
}

  const approveGcashPayment = async (paymentId: number, approvalNotes?: string) => {
    try {
      await gcashpayments_api.approvePayment(paymentId, { remarks: approvalNotes })
      
      // Update local state
      gcashPayments.value = gcashPayments.value.filter(p => p.id !== paymentId)
      
      // Close modal
      isApproveModalOpen.value = false
      selectedPayment.value = null
    } catch (err: any) {
      error.value = err.message || 'Failed to approve GCash payment'
      throw err
    }
  }

  const rejectGcashPayment = async (paymentId: number, rejectionReasonText: string) => {
    try {
      await gcashpayments_api.rejectPayment(paymentId, { remarks: rejectionReasonText })
      
      // Update local state
      gcashPayments.value = gcashPayments.value.filter(p => p.id !== paymentId)
      
      // Reset form
      isRejectModalOpen.value = false
      selectedPayment.value = null
      rejectionReason.value = ''
    } catch (err: any) {
      error.value = err.message || 'Failed to reject GCash payment'
      throw err
    }
  }

  const openApproveModal = (payment: PaymentApproval) => {
    selectedPayment.value = payment
    isApproveModalOpen.value = true
  }

  const openRejectModal = (payment: PaymentApproval) => {
    selectedPayment.value = payment
    isRejectModalOpen.value = true
  }

  const handlePageChange = (page: number) => {
    currentPage.value = page
  }

  const clearFilters = () => {
    searchQuery.value = ''
    activeFilter.value = 'all'
    currentPage.value = 1
  }

  const clearStudentData = () => {
    currentStudent.value = null
    studentFees.value = []
    studentFeesSummary.value = null
  }

  // Get student fees for a specific payment
  const getFeesForPayment = async (paymentId: number) => {
    const payment = gcashPayments.value.find(p => p.id === paymentId)
    if (!payment) return null
    
    try {
      const response = await studentApi.getStudentFees(payment.student)
      return response.data
    } catch (err) {
      console.error('Error fetching fees for payment:', err)
      return null
    }
  }

  // Update payment status locally (for optimistic updates)
  const updatePaymentStatus = (paymentId: number, status: 'approved' | 'rejected', remarks?: string) => {
    const index = gcashPayments.value.findIndex(p => p.id === paymentId)
    if (index !== -1) {
      gcashPayments.value.splice(index, 1)
    }
  }

  return {
    // State
    gcashPayments,
    selectedPayment,
    currentPage,
    perPage,
    searchQuery,
    activeFilter,
    isLoading,
    error,
    isApproveModalOpen,
    isRejectModalOpen,
    rejectionReason,
    currentStudent,
    studentFees,
    studentFeesSummary,
    isStudentLoading,
    studentError,
    
    // Computed
    stats,
    filteredPayments,
    totalPages,
    paginatedPayments,
    
    // Actions
    fetchGcashPayments,
    fetchStudentProfile,
    approveGcashPayment,
    rejectGcashPayment,
    openApproveModal,
    openRejectModal,
    handlePageChange,
    clearFilters,
    clearStudentData,
    getFeesForPayment,
    updatePaymentStatus,
    transformPaymentData
  }
})