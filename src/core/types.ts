export interface ApiResponse<T> {
  status_code: number
  message: string
  data: T
  errors: Record<string, string[]> | null
}

export interface PaginatedApiResponse<T> {
  current_page: number
  per_page: number
  total_pages: number
  total_items: number
  data: T[]
}

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}


// STUDENT TYPES
export interface Student {
  id: number
  s_studentID: string
  s_fname: string
  s_mname: string
  s_lname: string
  s_suffix?: string
  s_email: string
  s_set: string
  s_lvl: number
  s_status: 'enrolled' | 'graduated' | 'dropout'
  s_image?: string
  program: {
    id: number
    name: string
    status: string
    institute: {
      id: number
      institute_name: string
      school_name: string
      school_short_name: string
    }
  }
}

export interface FeeCategory {
  id: number
  category_name: string
  collection_fee: string
  description: string
}

export interface StudentFee {
  id: number
  category: FeeCategory
  total_amount: string
  balance: string
  status: 'paid' | 'partial' | 'pending'
  due_date: string
  academic_year: string
  semester: string
  remarks: string
}

export interface FeesSummary {
  student_id: number
  total_amount: number
  total_balance: number
}


// GCASH PAYMENT TYPES
export interface GcashPaymentSubmission {
  id: number
  screenshot_urls: string[]
  screenshot: string
  amount_paid: string
  reference_number: string
  status: 'pending' | 'approved' | 'rejected'
  reviewed_at: string | null
  remarks: string
  created_at: string
  updated_at: string
  student: number
  fee: number
  reviewed_by: number | null
  updated_by: number | null
}

export interface PaymentApproval extends GcashPaymentSubmission {
  name?: string
  studentId?: string
  feeType?: string
  daysAgo?: number
  sender?: string
  description?: string
  priority: 'high' | 'medium' | 'low'
  notes?: string
}

// STORE STATE TYPES
export interface GcashPaymentStoreState {
  gcashPayments: PaymentApproval[]
  filteredPayments: PaymentApproval[]
  paginatedPayments: PaymentApproval[]
  selectedPayment: PaymentApproval | null
  currentPage: number
  perPage: number
  totalPages: number
  searchQuery: string
  activeFilter: 'all' | PaymentApproval['priority']
  isLoading: boolean
  error: string | null
  stats: {
    pendingApprovals: number
    highPriorityCount: number
    totalAmount: number
    averageAmount: number
  }
  isApproveModalOpen: boolean
  isRejectModalOpen: boolean
  rejectionReason: string
  
  // Student data
  currentStudent: Student | null
  studentFees: StudentFee[]
  studentFeesSummary: FeesSummary | null
  isStudentLoading: boolean
  studentError: string | null
}

// PAYMENT TYPES
export interface PaymentHistory {
    id: number;
    fee: {
        id: number;
        student: {
            id: number;
            s_studentID: string;
            s_fname: string;
            s_mname: string;
            s_lname: string;
            s_suffix: string;
            s_email: string;
            s_set: string;
            s_lvl: number;
        };
        category_name: string;
        total_amount: string;
        balance: string;
        status: string;
        due_date: string;
        issued_by: number;
        remarks: string;
        academic_year: string;
        semester: string;
    };
    received_by: any;
    created_at: string;
    updated_at: string;
    amount_paid: string;
    payment_method: 'cash' | 'gcash' | 'bank' | 'online' | 'other';
    updated_by: number | null;
    payment_submission: number | null;
}
