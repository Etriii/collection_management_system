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
    fee: number;
    reviewed_by: number | null;
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
        const response = await apiService.get<ApiResponse<StudentFee[]>>(
            `/api/v1/students/${studentId}/fees/`
        );
        return response.data || [];
    });
}

async function fetchStudentFeesSummary(studentId: number): Promise<FeesSummary | null> {
    return fetchWithRetry(async () => {
        const response = await apiService.get<ApiResponse<FeesSummary>>(
            `/api/v1/students/${studentId}/fees-summary/`
        );
        return response.data || null;
    });
}

async function transformPaymentSubmission(
    payment: GcashPaymentSubmissionResponse
): Promise<GcashPaymentSubmission> {
    const [student, fee] = await Promise.all([
        fetchStudentDetails(payment.student),
        fetchFeeDetails(payment.fee)
    ]);

    let fullName = 'Unknown Student';
    if (student) {
        fullName = `${student.s_fname || ''} ${student.s_mname || ''} ${student.s_lname || ''}`.trim();
        if (student.s_suffix) {
            fullName += ` ${student.s_suffix}`;
        }
    }

    let feeType = 'Unknown Fee';
    let feeDescription = 'Payment Submission';
    if (fee?.category) {
        feeType = fee.category.category_name || fee.category.name || 'Unknown Fee';
        feeDescription = fee.category.description || 'Payment Submission';
    }

    const created = new Date(payment.created_at);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - created.getTime());
    const daysAgo = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    const amount = parseFloat(payment.amount_paid);
    let priority: 'high' | 'medium' | 'low' = 'low';
    if (amount > 5000 || daysAgo > 7) {
        priority = 'high';
    } else if (amount > 1000 || daysAgo > 3) {
        priority = 'medium';
    }

    return {
        ...payment,
        screenshot_urls: Array.isArray(payment.screenshot_urls)
            ? payment.screenshot_urls
            : typeof payment.screenshot_urls === 'string'
                ? [payment.screenshot_urls]
                : [],
        name: fullName,
        studentId: student?.s_studentID || '',
        feeType,
        daysAgo,
        sender: fullName,
        description: feeDescription,
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
    student__id?: number;
  }): Promise<PaginatedResponse<GcashPaymentSubmission>> => {
    try {
      const apiParams: any = {
        current_page: params?.current_page ?? 1,
        per_page: params?.per_page ?? 100,
      };

      if (params?.search) apiParams.search = params.search;
      if (params?.ordering) apiParams.ordering = params.ordering;
      if (params?.student__id) apiParams.student__id = params.student__id;

      console.log('Fetching payment submissions with params:', apiParams);

      const response = await fetchWithRetry(() =>
        apiService.get('/api/v1/payment_submissions/', { params: apiParams })
      );

      console.log('API Response:', response.data);
      
      const apiData = response.data;
      
      if (!apiData || !apiData.data || !Array.isArray(apiData.data)) {
        console.error('Invalid API response format. Expected data array:', apiData);
        return {
          count: 0,
          next: null,
          previous: null,
          results: []
        };
      }

      console.log(`Found ${apiData.data.length} payment submissions in API response`);
      
      const pendingSubmissions = apiData.data.filter(
        (p: GcashPaymentSubmissionResponse) => p.status === 'pending'
      );
      
      console.log(`Found ${pendingSubmissions.length} pending submissions`);

      const transformedPayments = await Promise.all(
        pendingSubmissions.map((payment: GcashPaymentSubmissionResponse) =>
          transformPaymentSubmission(payment)
        )
      );

      return {
        count: apiData.total_items || transformedPayments.length,
        next: null,
        previous: null,
        results: transformedPayments
      };

    } catch (error) {
      console.error("Error fetching payment submissions:", error);
      return {
        count: 0,
        next: null,
        previous: null,
        results: []
      };
    }
  },

    getPaymentSubmission: async (id: number): Promise<GcashPaymentSubmissionResponse> => {
        return fetchWithRetry(async () => {
            const response = await apiService.get<ApiResponse<GcashPaymentSubmissionResponse>>(
                `/api/v1/payment_submissions/${id}/`
            );
            return response.data;
        });
    },

    approvePayment: async (id: number, data: { remarks?: string }): Promise<any> => {
        try {
            console.log(`Approving payment submission ${id} with remarks:`, data.remarks);

            const response = await apiService.post<ApiResponse<any>>(
                `/api/v1/payment_submissions/${id}/approve/`,
                data
            );

            cache.clear();
            return response.data;
        } catch (error) {
            console.error(`Error approving payment ${id}:`, error);
            throw error;
        }
    },

    rejectPayment: async (id: number, data: { remarks: string }): Promise<any> => {
        try {
            console.log(`Rejecting payment submission ${id} with remarks:`, data.remarks);

            const response = await apiService.post<ApiResponse<any>>(
                `/api/v1/payment_submissions/${id}/reject/`,
                data
            );

            cache.clear();
            return response.data;
        } catch (error) {
            console.error(`Error rejecting payment ${id}:`, error);
            throw error;
        }
    },

    updatePayment: async (id: number, data: Partial<GcashPaymentSubmissionResponse>): Promise<GcashPaymentSubmissionResponse> => {
        return fetchWithRetry(async () => {
            const response = await apiService.put<ApiResponse<GcashPaymentSubmissionResponse>>(
                `/api/v1/payment_submissions/${id}/`,
                data
            );
            cache.clear();
            return response.data;
        });
    },

    deletePayment: async (id: number): Promise<void> => {
        await fetchWithRetry(async () => {
            await apiService.delete(`/api/v1/payment_submissions/${id}/`);
            cache.clear();
        });
    },

    getStudentProfile: async (studentId: number): Promise<{
        student: Student;
        fees: StudentFee[];
        summary: FeesSummary | null;
    }> => {
        try {
            const [studentResponse, feesResponse, summaryResponse] = await Promise.all([
                fetchStudentDetails(studentId),
                fetchStudentFees(studentId),
                fetchStudentFeesSummary(studentId)
            ]);

            return {
                student: studentResponse || {
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
                },
                fees: feesResponse || [],
                summary: summaryResponse
            };
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

getStudentPaymentSubmissions: async (studentId: number, params?: {
    current_page?: number;
    per_page?: number;
    search?: string;
    ordering?: string;
}): Promise<PaginatedResponse<GcashPaymentSubmissionResponse>> => {
    try {
        const apiParams: any = {
            current_page: params?.current_page ?? 1,
            per_page: params?.per_page ?? 5,
            student__id: studentId,
        };

        if (params?.search) apiParams.search = params.search;
        if (params?.ordering) apiParams.ordering = params.ordering;

        console.log('Fetching submissions with params:', apiParams);

        const response = await fetchWithRetry(() =>
            apiService.get('/api/v1/payment_submissions/', { params: apiParams })
        );
        
        const paginationWrapper = response.data;
        const submissions = paginationWrapper?.data;

        console.log('Pagination metadata:', {
            current_page: paginationWrapper?.current_page,
            per_page: paginationWrapper?.per_page,
            total_items: paginationWrapper?.total_items,
            total_pages: paginationWrapper?.total_pages,
            data_length: submissions?.length || 0
        });

        if (Array.isArray(submissions)) {
            const filteredSubmissions = submissions.filter(
                (sub: any) => sub.student === studentId
            );
            
            console.log(`Page ${paginationWrapper?.current_page}: ${filteredSubmissions.length} submissions`);
            
            return {
                count: paginationWrapper?.total_items || filteredSubmissions.length,
                next: paginationWrapper?.current_page < paginationWrapper?.total_pages 
                    ? String(paginationWrapper.current_page + 1) 
                    : null,
                previous: paginationWrapper?.current_page > 1 
                    ? String(paginationWrapper.current_page - 1) 
                    : null,
                results: filteredSubmissions
            };
        }

        console.warn('No payment submissions found');
        return {
            count: 0,
            next: null,
            previous: null,
            results: []
        };

    } catch (error) {
        console.error(`Error fetching payment submissions:`, error);
        return {
            count: 0,
            next: null,
            previous: null,
            results: []
        };
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
};

export const studentApi = {
    getStudent: fetchStudentDetails,
    getStudentFees: fetchStudentFees,
    getStudentFeesSummary: fetchStudentFeesSummary,
    getStudents: gcashpayments_api.getAllStudents
};

export default gcashpayments_api;