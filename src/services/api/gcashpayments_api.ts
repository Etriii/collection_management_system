import type {
    GcashPaymentSubmission,
    Student,
    StudentFee,
    FeesSummary,
    PaginatedResponse,
    ApiResponse,
    PaymentHistory,
} from '@/core/types'
import apiService from '@/services/apiService.ts'

export type PaymentSubmissionStatus = "pending" | "approved" | "rejected"

export interface GcashPaymentSubmissionResponse {
    id: number;
    screenshot_urls: string[];
    created_at: string;
    updated_at: string;
    screenshot: string;
    amount_paid: string;
    reference_number: string;
    status: PaymentSubmissionStatus;
    reviewed_at: string | null;
    remarks: string;
    updated_by: number | null;
    student: number;
    fee: number | {
        id: number;
        student: {
            id: number;
            full_name: string;
            program_name: string;
            s_set: string;
            s_lvl: number;
        };
        category_id: string;
        category_name: string;
        total_amount: string;
        balance: string;
        status: string;
    };
    reviewed_by: number | null;
}


export interface PaymentSubmissionFeeItem {
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

export interface PaymentSubmissionDetailResponse {
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
  fee_items: PaymentSubmissionFeeItem[]
  created_at: string
  updated_at: string
  total_amount_paid: string
  reference_number: string
  status: PaymentSubmissionStatus
  reviewed_at: string | null
  remarks: string | null
  updated_by: number | null
}

function unwrapApi<T>(raw: any): T {
  if (raw && typeof raw === "object" && "status_code" in raw && "data" in raw) {
    return raw.data as T
  }
  return raw as T
}

const cache = {
    studentDetails: new Map<number, Student>(),
    feeDetails: new Map<number, any>(),

    getStudent(id: number): Student | undefined {
        return this.studentDetails.get(id);
    },

    setStudent(id: number, student: Student): void {
        this.studentDetails.set(id, student);
    },

    getFee(id: number): any | undefined {
        return this.feeDetails.get(id);
    },

    setFee(id: number, fee: any): void {
        this.feeDetails.set(id, fee);
    },

    clear(): void {
        this.studentDetails.clear();
        this.feeDetails.clear();
    }
};

async function fetchWithRetry<T>(
    fetcher: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
): Promise<T> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await fetcher();
        } catch (error) {
            if (attempt === maxRetries) throw error;
            console.warn(`Attempt ${attempt} failed, retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    throw new Error('All retry attempts failed');
}

async function fetchStudentDetails(studentId: number): Promise<Student | null> {
    if (!studentId || isNaN(studentId)) {
        console.error("Invalid studentId:", studentId);
        return null;
    }

    const cached = cache.getStudent(studentId);
    if (cached) return cached;

    return fetchWithRetry(async () => {
        const response = await apiService.get<ApiResponse<Student>>(
            `/api/v1/students/${studentId}/`
        );
        const student = response.data;
        if (student) {
            cache.setStudent(studentId, student);
        }
        return student || null;
    });
}


async function fetchFeeDetails(feeId: number): Promise<any | null> {
    if (!feeId || isNaN(feeId)) {
        console.error("Invalid feeId:", feeId);
        return null;
    }

    const cached = cache.getFee(feeId);
    if (cached) return cached;

    return fetchWithRetry(async () => {
        const response = await apiService.get<ApiResponse<any>>(
            `/api/v1/fees/${feeId}/`
        );
        const fee = response.data;
        if (fee) {
            cache.setFee(feeId, fee);
        }
        return fee || null;
    });
}

async function fetchStudentFees(studentId: number): Promise<StudentFee[]> {
    return fetchWithRetry(async () => {
        const response = await apiService.get<any>(
            `/api/v1/fees/`,
            { student_id: studentId, per_page: 100 }
        );
        
        const fees = response.data?.results || response.data?.data || [];
        return Array.isArray(fees) ? fees : [];
    });
}

async function fetchStudentFeesSummary(studentId: number): Promise<FeesSummary | null> {
    return fetchWithRetry(async () => {
        try {
            const fees = await fetchStudentFees(studentId);
            
            const totalAmount = fees.reduce((sum, fee) => sum + parseFloat(fee.total_amount || '0'), 0);
            const totalBalance = fees.reduce((sum, fee) => sum + parseFloat(fee.balance || '0'), 0);
            const totalPaid = totalAmount - totalBalance;
            
            const pendingFees = fees.filter(f => f.status === 'pending').length;
            const paidFees = fees.filter(f => f.status === 'paid').length;
            const overdueFees = fees.filter(f => f.status === 'overdue').length;
            const waivedFees = fees.filter(f => f.status === 'waived').length;
            
            return {
                total_amount: totalAmount.toString(),
                total_paid: totalPaid.toString(),
                total_balance: totalBalance.toString(),
                pending_fees: pendingFees,
                paid_fees: paidFees,
                overdue_fees: overdueFees,
                waived_fees: waivedFees
            };
        } catch (error) {
            console.error('Error calculating fees summary:', error);
            return null;
        }
    });
}

async function transformPaymentSubmission(
    payment: any
): Promise<GcashPaymentSubmission> {
    const studentData = payment.student;
    const feeData = payment.fee;
    
    const studentId = studentData?.id;
    const feeId = typeof feeData === 'number' ? feeData : feeData?.id;

    const fullName = studentData?.full_name || 'Unknown Student';
    const feeType = feeData?.category_name || 'Unknown Fee';

    const created = new Date(payment.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const amountPaid = payment.total_amount_paid || payment.amount_paid || '0';
    const amount = parseFloat(amountPaid);
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (amount > 5000 || daysAgo > 7) {
        priority = 'high';
    } else if (amount > 1000 || daysAgo > 3) {
        priority = 'medium';
    }

    return {
        id: payment.id,
        student: studentId || 0,
        fee: feeId || 0,
        screenshot_urls: Array.isArray(payment.screenshot_urls)
            ? payment.screenshot_urls
            : typeof payment.screenshot_urls === 'string'
                ? [payment.screenshot_urls]
                : [],
        created_at: payment.created_at,
        updated_at: payment.updated_at || payment.created_at,
        screenshot: payment.screenshot_urls?.[0] || payment.screenshot || '',
        amount_paid: amountPaid,
        reference_number: payment.reference_number || '',
        status: payment.status,
        reviewed_at: payment.reviewed_at || null,
        remarks: payment.remarks || '',
        updated_by: payment.updated_by || null,
        reviewed_by: payment.reviewed_by || null,
        
        name: fullName,
        studentId: studentId?.toString() || '',
        feeType,
        daysAgo,
        sender: fullName,
        description: `${feeType} - ${fullName}`,
        priority,
        notes: payment.remarks || undefined
    };
}

export const gcashpayments_api = {
getPaymentSubmissions: async (params?: {
  current_page?: number;
  per_page?: number;
  search?: string;
  ordering?: string;
  student_id?: number;
  status?: string;
}): Promise<PaginatedResponse<GcashPaymentSubmission>> => {
  try {
    const apiParams: any = {
      current_page: params?.current_page ?? 1,
      per_page: params?.per_page ?? 10,
      ordering: params?.ordering ?? "-created_at",
    }

    if (params?.search) apiParams.search = params.search
    if (params?.student_id) apiParams.student_id = params.student_id
    if (params?.status) apiParams.status = params.status

    console.log("Fetching payment submissions with params:", apiParams)

    const response = await fetchWithRetry(() =>
      apiService.get("/api/v1/payment-submissions/", apiParams)
    )

    const payload = unwrapApi<{
      current_page: number
      per_page: number
      total_pages: number
      total_items: number
      data: any[]
    }>(response.data)

    console.log("API Response (normalized payload):", payload)

    const rows = Array.isArray(payload?.data) ? payload.data : []
    console.log(`Found ${rows.length} payment submissions in API response`)

    const transformedPayments = await Promise.all(rows.map(transformPaymentSubmission))

    return {
      count: payload.total_items ?? transformedPayments.length,
      next: payload.current_page < payload.total_pages ? String(payload.current_page + 1) : null,
      previous: payload.current_page > 1 ? String(payload.current_page - 1) : null,
      results: transformedPayments,
    }
  } catch (error) {
    console.error("Error fetching payment submissions:", error)
    return { count: 0, next: null, previous: null, results: [] }
  }
},

    getPaymentSubmission: async (id: number): Promise<PaymentSubmissionDetailResponse> => {
  return fetchWithRetry(async () => {
    const response = await apiService.get(`/api/v1/payment-submissions/${id}/`)

    const payload = unwrapApi<PaymentSubmissionDetailResponse>(response.data)

    return payload
  })
},

approvePayment: async (
  submissionId: number,
  data: { remarks?: string }
): Promise<any> => {
  try {
    console.log(`Approving payment submission ${submissionId} with remarks:`, data.remarks)

    const response = await apiService.post(
      `/api/v1/payment-submissions/${submissionId}/approve/`,
      { remarks: data.remarks || "" }
    )

    cache.clear()
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      console.error(`DRF validation error for approving payment ${submissionId}:`, error.response.data)
    } else {
      console.error(`Error approving payment ${submissionId}:`, error)
    }
    throw error
  }
},

rejectPayment: async (
  submissionId: number,
  data: { remarks: string }
): Promise<any> => {
  try {
    const response = await apiService.post(
      `/api/v1/payment-submissions/${submissionId}/reject/`,
      { remarks: data.remarks }
    )
    cache.clear()
    return response.data
  } catch (error: any) {
    if (error.response?.data) {
      console.error(`DRF validation error for rejecting payment ${submissionId}:`, error.response.data)
    } else {
      console.error(`Error rejecting payment ${submissionId}:`, error)
    }
    throw error
  }
},

 bulkCreatePayments: async (payments: Array<{
        fee: number;
        amount_paid: string;
        payment_method?: string | null;
        payment_submission?: number | null;
    }>): Promise<any> => {
        if (!Array.isArray(payments) || payments.length === 0) {
            throw new Error('Payments array must not be empty');
        }

        try {
            console.log('Submitting bulk payments:', payments);

            const response = await fetchWithRetry(() =>
                apiService.post('/api/v1/payments/bulk/', {
                    payments
                })
            );

            console.log('Bulk payments response:', response.data);

            cache.clear();

            return response.data;
        } catch (error: any) {
            console.error('Error bulk creating payments:', error.response?.data || error);
            throw error;
        }
    },

    updatePayment: async (id: number, data: Partial<GcashPaymentSubmissionResponse>): Promise<GcashPaymentSubmissionResponse> => {
        return fetchWithRetry(async () => {
            const response = await apiService.put<ApiResponse<GcashPaymentSubmissionResponse>>(
                `/api/v1/payment-submissions/${id}/`,
                data
            );
            cache.clear();
            return response.data;
        });
    },

    deletePayment: async (id: number): Promise<void> => {
        await fetchWithRetry(async () => {
            await apiService.delete(`/api/v1/payment-submissions/${id}/`);
            cache.clear();
        });
    },

getStudentProfile: async (studentId: number): Promise<{
    student: Student;
    fees: StudentFee[];
    summary: FeesSummary | null;
}> => {
    try {
        const [studentResponse, feesResponse, summaryResponse] = await Promise.allSettled([
            fetchStudentDetails(studentId),
            fetchStudentFees(studentId),
            fetchStudentFeesSummary(studentId)
        ]);

        const student = studentResponse.status === 'fulfilled' && studentResponse.value
            ? studentResponse.value
            : {
                id: studentId,
                s_studentID: 'Unknown',
                s_fname: 'Unknown',
                s_mname: '',
                s_lname: 'Student',
                s_suffix: '',
                s_email: '',
                s_set: '',
                s_lvl: 0,
                s_status: 'enrolled',
                program: {
                    id: 0,
                    name: 'Unknown',
                    status: 'active',
                    institute: {
                        id: 0,
                        institute_name: 'Unknown',
                        school_name: 'Unknown',
                        school_short_name: 'UN'
                    }
                }
            };

        const fees = feesResponse.status === 'fulfilled' && feesResponse.value
            ? feesResponse.value
            : [];

        const summary = summaryResponse.status === 'fulfilled' && summaryResponse.value
            ? summaryResponse.value
            : null;

        return { student, fees, summary };
    } catch (error) {
        console.error(`Error fetching student profile ${studentId}:`, error);
        throw error;
    }
},

    getAllStudents: async (params?: {
        search?: string;
        per_page?: number;
    }): Promise<PaginatedResponse<Student>> => {
        return fetchWithRetry(async () => {
            const response = await apiService.get<PaginatedResponse<Student>>(
                '/api/v1/students/',
                { params }
            );
            return response;
        });
    },

    clearCache: (): void => {
        cache.clear();
    },

    getStatistics: async (): Promise<{
        pendingCount: number;
        approvedCount: number;
        rejectedCount: number;
        totalAmount: number;
        averageAmount: number;
    }> => {
        try {
            const response = await gcashpayments_api.getPaymentSubmissions({ per_page: 1000 });
            const submissions = response.results;

            const pending = submissions.filter(p => p.status === "pending");
            const approved = submissions.filter(p => p.status === "approved");
            const rejected = submissions.filter(p => p.status === "rejected");

            const totalAmount = submissions.reduce((sum, p) => sum + parseFloat(p.amount_paid), 0);
            const averageAmount = submissions.length > 0 ? totalAmount / submissions.length : 0;

            return {
                pendingCount: pending.length,
                approvedCount: approved.length,
                rejectedCount: rejected.length,
                totalAmount,
                averageAmount
            };
        } catch (error) {
            console.error("Error fetching statistics:", error);
            return {
                pendingCount: 0,
                approvedCount: 0,
                rejectedCount: 0,
                totalAmount: 0,
                averageAmount: 0
            };
        }
    },

getStudentPaymentSubmissions: async (
  studentId: number,
  params?: {
    current_page?: number
    per_page?: number
    search?: string
    ordering?: string
  }
): Promise<PaginatedResponse<GcashPaymentSubmissionResponse>> => {
  try {
    const apiParams: any = {
      current_page: params?.current_page ?? 1,
      per_page: params?.per_page ?? 5,
      student__id: studentId,
    }

    if (params?.search) apiParams.search = params.search
    if (params?.ordering) apiParams.ordering = params.ordering

    console.log("Fetching submissions with params:", apiParams)

    const response = await fetchWithRetry(() =>
      apiService.get("/api/v1/payment-submissions/", apiParams)
    )

    const paginationWrapper = response.data
    const submissions = paginationWrapper?.data

    console.log("Pagination metadata:", {
      current_page: paginationWrapper?.current_page,
      per_page: paginationWrapper?.per_page,
      total_items: paginationWrapper?.total_items,
      total_pages: paginationWrapper?.total_pages,
      data_length: submissions?.length || 0,
    })

    if (Array.isArray(submissions)) {
      const filteredSubmissions = submissions.filter((sub: any) => {
        const sid = sub?.student?.id ?? sub?.student
        return Number(sid) === Number(studentId)
      })

      console.log(
        `Page ${paginationWrapper?.current_page}: ${filteredSubmissions.length} submissions`
      )

      const current = Number(paginationWrapper?.current_page ?? 1)
      const totalPages = Number(paginationWrapper?.total_pages ?? 1)

      return {
        count: Number(paginationWrapper?.total_items ?? filteredSubmissions.length),
        next: current < totalPages ? String(current + 1) : null,
        previous: current > 1 ? String(current - 1) : null,
        results: filteredSubmissions,
      }
    }

    console.warn("No payment submissions found (data is not an array)")
    return { count: 0, next: null, previous: null, results: [] }
  } catch (error) {
    console.error(`Error fetching payment submissions:`, error)
    return { count: 0, next: null, previous: null, results: [] }
  }
},

    getStudentPaymentHistory: async (studentId: number, params?: {
        current_page?: number;
        per_page?: number;
        search?: string;
        ordering?: string;
    }): Promise<PaginatedResponse<PaymentHistory>> => {
        try {
            const apiParams: any = {
                current_page: params?.current_page ?? 1,
                per_page: params?.per_page ?? 5,
                student_id: studentId,
            };

            if (params?.search) apiParams.search = params.search;
            if (params?.ordering) apiParams.ordering = params.ordering;

            console.log('Fetching payment history with params:', apiParams);

            const response = await fetchWithRetry(() =>
                apiService.get('/api/v1/payments/', { params: apiParams })
            );
            
            const paginationWrapper = response.data;
            const payments = paginationWrapper?.data;

            console.log('Pagination metadata:', {
                current_page: paginationWrapper?.current_page,
                per_page: paginationWrapper?.per_page,
                total_items: paginationWrapper?.total_items,
                total_pages: paginationWrapper?.total_pages,
                data_length: payments?.length || 0
            });

            if (Array.isArray(payments)) {
                const filteredPayments = payments.filter(
                    (payment: any) => payment.fee?.student?.id === studentId
                );
                
                console.log(`Page ${paginationWrapper?.current_page}: ${filteredPayments.length} payments`);
                
                return {
                    count: paginationWrapper?.total_items || filteredPayments.length,
                    next: paginationWrapper?.current_page < paginationWrapper?.total_pages 
                        ? String(paginationWrapper.current_page + 1) 
                        : null,
                    previous: paginationWrapper?.current_page > 1 
                        ? String(paginationWrapper.current_page - 1) 
                        : null,
                    results: filteredPayments
                };
            }

            console.warn('No payment history found');
            return {
                count: 0,
                next: null,
                previous: null,
                results: []
            };

        } catch (error) {
            console.error(`Error fetching payment history:`, error);
            return {
                count: 0,
                next: null,
                previous: null,
                results: []
            };
        }
    },

getProgram: async (programId: number) => {
    if (!programId || isNaN(programId)) {
        throw new Error(`Invalid programId: ${programId}`);
    }

    return fetchWithRetry(async () => {
        const response = await apiService.get<ApiResponse<any>>(
            `/api/v1/programs/${programId}/`
        );

        return response.data;
    });
},

getInstitute: async (instituteId: number) => {
    if (!instituteId || isNaN(instituteId)) {
        throw new Error(`Invalid instituteId: ${instituteId}`);
    }

    return fetchWithRetry(async () => {
        const response = await apiService.get<ApiResponse<any>>(
            `/api/v1/institutes/${instituteId}/`
        );
        return response.data;
    });
},

getSchool: async (schoolId: number) => {
    if (!schoolId || isNaN(schoolId)) {
        throw new Error(`Invalid schoolId: ${schoolId}`);
    }

    return fetchWithRetry(async () => {
        const response = await apiService.get<ApiResponse<any>>(
            `/api/v1/schools/${schoolId}/`
        );
        return response.data;
    });
},
};

export const studentApi = {
    getStudent: fetchStudentDetails,
    getStudentFees: fetchStudentFees,
    getStudentFeesSummary: fetchStudentFeesSummary,
    getStudents: gcashpayments_api.getAllStudents
};

export default gcashpayments_api;