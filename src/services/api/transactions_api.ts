import type { ApiResponse } from "@core/types";
import apiService from "@/services/apiService.ts";

export type TransactionStatus = "sent" | "paid" | "overdue";
export type PaymentSubmissionStatus = "pending" | "approved" | "rejected"; 
export type TransactionCategory = "T-Shirt" | "Attendance Fees" | "Locker" | "Others";

export interface Transaction {
  id: string;
  transactionNumber: string;
  studentId: string;
  student: string;
  category: TransactionCategory;
  amount: number;
  dueDate: string;
  status: TransactionStatus;
  paymentSubmissionStatus?: PaymentSubmissionStatus; 
  received_by?: string;
  payment_method?: string;
  created_at?: string;
  fee_id?: number;
  payment_submission_id?: number;
}

export interface Fee {
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
    program?: {
      id: number;
      name: string;
      institute?: {
        id: number;
        institute_name: string;
        school?: {
          id: number;
          school_name: string;
          short_name: string;
        };
      };
    };
  };
  category: {
    id: number;
    category_name: string;
    collection_fee: string;
    description?: string;
    institute?: {
      id: number;
      institute_name: string;
    };
  };
  total_amount: string;
  balance: string;
  status: "pending" | "partial" | "paid" | "waived" | "overdue";
  due_date: string;
  issued_by: number;
  remarks: string;
  academic_year: string;
  semester: "1st" | "2nd";
  created_at?: string;
  updated_at?: string;
}

export interface FeeDropdownOption {
  id: number;
  value: number;
  label: string;
  studentId: string;
  studentName: string;
  amount: number;
  dueDate: string;
  status: string;
  category: string;
  category_id: number;
  category_name: string;
  feeData: Fee;
  balance: number;
}

export interface CreatePaymentDto {
  fee: number;
  amount_paid: string;
  payment_method: "cash" | "gcash" | "bank" | "online" | "other";
  payment_submission?: number | null;
}

export interface BulkPaymentsDto {
  payments: CreatePaymentDto[];
}

export interface PaymentApiResponse {
  id: number;
  fee: {
    id: number;
    student: Student;
    category_name: string;
    total_amount: string;
    balance: string;
    status: string;
    due_date: string;
  };
  received_by: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
  };
  created_at: string;
  updated_at: string;
  amount_paid: string;
  payment_method: string;
  payment_submission: number | null;
}

export interface BulkPaymentResponse {
  payments: PaymentApiResponse[];
}

export interface PaymentSubmissionResponse {
  id: number;
  screenshot_urls: string;
  created_at: string;
  updated_at: string;
  screenshot: string;
  amount_paid: string;
  reference_number: string;
  status: PaymentSubmissionStatus;
  reviewed_at: string;
  remarks: string;
  updated_by: number;
  student: number; 
  fee: number;
  reviewed_by: number;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

const cache = {
  categories: new Map<number, string>(),
  feeDetails: new Map<number, Fee>(),
  studentDetails: new Map<number, any>(),
  
  getCategory(id: number): string | undefined {
    return this.categories.get(id);
  },
  
  setCategory(id: number, name: string): void {
    this.categories.set(id, name);
  },
  
  getFee(id: number): Fee | undefined {
    return this.feeDetails.get(id);
  },
  
  setFee(id: number, fee: Fee): void {
    this.feeDetails.set(id, fee);
  },
  
  getStudent(id: number): any | undefined {
    return this.studentDetails.get(id);
  },
  
  setStudent(id: number, student: any): void {
    this.studentDetails.set(id, student);
  },
  
  clear(): void {
    this.categories.clear();
    this.feeDetails.clear();
    this.studentDetails.clear();
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


async function fetchFeeDetails(feeId: number): Promise<Fee | null> {
  if (!feeId || isNaN(feeId)) {
    console.error("Invalid feeId:", feeId);
    return null;
  }
  
  const cached = cache.getFee(feeId);
  if (cached) return cached;
  
  return fetchWithRetry(async () => {
    const response = await apiService.get<ApiResponse<Fee>>(
      `/api/v1/fees/${feeId}/`
    );
    const fee = response.data;
    if (fee) {
      cache.setFee(feeId, fee);
    }
    return fee || null;
  });
}

async function fetchPaymentSubmission(id: number): Promise<PaymentSubmissionResponse | null> {
  return fetchWithRetry(async () => {
    const response = await apiService.get<ApiResponse<PaymentSubmissionResponse>>(
      `/api/v1/payment_submissions/${id}/`
    );
    return response.data || null;
  });
}

async function getAllCategories(): Promise<Map<number, string>> {
  if (cache.categories.size > 0) {
    return cache.categories;
  }
  
  try {
    console.log("Fetching all collection categories...");
    
    const response = await apiService.get<any>('/api/v1/collection-categories/', {
      params: { per_page: 1000 }
    });
    
    let categories = [];
    
    if (response.data && Array.isArray(response.data)) {
      categories = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      categories = response.data.data;
    } else if (response.data?.results && Array.isArray(response.data.results)) {
      categories = response.data.results;
    }
    
    console.log(`Loaded ${categories.length} collection categories`);
    
    categories.forEach((category: any) => {
      if (category.id !== undefined) {
        const name = category.name || category.category_name || 'Others';
        cache.setCategory(category.id, name);
      }
    });
    
    console.log("Category cache created with", cache.categories.size, "entries");
    
    return cache.categories;
    
  } catch (error) {
    console.error("Error fetching collection categories:", error);
    return new Map();
  }
}


async function mapPaymentToTransaction(payment: PaymentApiResponse): Promise<Transaction> {
  console.log("Mapping payment to transaction:", payment);
  
  const student = payment.fee?.student;
  const studentId = student?.s_studentID || `ID-${student?.id || 'N/A'}`;
  const studentName = student ? 
    `${student.s_fname || ''} ${student.s_lname || ''}`.trim() : 
    'Unknown Student';
  
  const categoryName = payment.fee?.category_name || 'General';
  let category: TransactionCategory = "Others";
  
  if (categoryName.toLowerCase().includes('locker')) {
    category = "Locker";
  } else if (categoryName.toLowerCase().includes('shirt') || categoryName.toLowerCase().includes('t-shirt')) {
    category = "T-Shirt";
  } else if (categoryName.toLowerCase().includes('attendance')) {
    category = "Attendance Fees";
  }
  
  let paymentSubmissionStatus: PaymentSubmissionStatus | undefined = undefined;
  if (payment.payment_submission) {
    paymentSubmissionStatus = "pending";
  }
  
  const amountPaid = parseFloat(payment.amount_paid || "0");
  
  let status: TransactionStatus = "sent";
  const feeStatus = payment.fee?.status?.toLowerCase();
  if (feeStatus === 'paid') {
    status = "paid";
  } else if (feeStatus === 'overdue') {
    status = "overdue";
  } else if (feeStatus === 'partial' || feeStatus === 'pending') {
    status = "sent";
  }
  
  if (paymentSubmissionStatus === "rejected") {
    status = "sent";
  }
  
  let dueDate = new Date().toISOString().split('T')[0];
  if (payment.fee?.due_date) {
    dueDate = payment.fee.due_date.split('T')[0];
  }
  
  const transaction: Transaction = {
    id: payment.id.toString(),
    transactionNumber: `TXN-${payment.id}`,
    studentId: studentId,
    student: studentName,
    category: category,
    amount: amountPaid,
    dueDate: dueDate,
    status: status,
    paymentSubmissionStatus: paymentSubmissionStatus,
    received_by: payment.received_by?.username,
    payment_method: payment.payment_method as any,
    created_at: payment.created_at,
    fee_id: payment.fee?.id,
    payment_submission_id: payment.payment_submission || undefined
  };
  
  console.log("Mapped transaction:", transaction);
  return transaction;
}

class TransactionsApi {
  private paymentsEndpoint = "/api/v1/payments/";
  private feesEndpoint = "/api/v1/fees/";
  private paymentSubmissionsEndpoint = "/api/v1/payment_submissions/";

  async getAll(params: {
    current_page?: number;
    per_page?: number;
    search?: string;
    student_id?: string;
    status?: string;
    payment_submission_status?: PaymentSubmissionStatus; 
  } = {}): Promise<ApiResponse<PaginatedResponse<Transaction>>> {
    try {
      console.log("Fetching payments with params:", params);
      
      const backendParams: any = {
        page: params.current_page || 1,
        per_page: params.per_page || 10,
      };
      
      if (params.search) backendParams.search = params.search;
      if (params.student_id) backendParams.student_id = params.student_id;
      
      const response = await fetchWithRetry(async () => {
        return await apiService.get<PaginatedResponse<PaymentApiResponse>>(
          this.paymentsEndpoint, 
          { params: backendParams }
        );
      });
      
      console.log("Payments API response structure:", response);
      
      if (!response.results) {
        console.error("No results in payments response");
        return {
          status_code: 200,
          message: "Success",
          data: {
            count: 0,
            next: null,
            previous: null,
            results: []
          },
          errors: null
        };
      }
      
      const transactionsPromises = response.results.map(payment => 
        mapPaymentToTransaction(payment)
      );
      
      let transactions = await Promise.all(transactionsPromises);
      
      if (params.payment_submission_status) {
        transactions = transactions.filter(transaction => 
          transaction.paymentSubmissionStatus === params.payment_submission_status
        );
      }
      
      if (params.status && params.status !== "all") {
        transactions = transactions.filter(transaction => 
          transaction.status === params.status
        );
      }
      
      return {
        status_code: 200,
        message: "Success",
        data: {
          count: transactions.length,
          next: response.next,
          previous: response.previous,
          results: transactions
        },
        errors: null
      };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return {
        status_code: 500,
        message: "Error fetching transactions",
        data: {
          count: 0,
          next: null,
          previous: null,
          results: []
        },
        errors: error instanceof Error ? [error.message] : ["Unknown error"]
      };
    }
  }

  async getFees(params: {
    search?: string;
    student_id?: string;
    status?: string | string[];
    per_page?: number;
    category_id?: number;
  } = {}): Promise<FeeDropdownOption[]> {
    try {
      console.log("Fetching fees with params:", params);
      
      const apiParams: any = {
        student_id: params.student_id,
        per_page: params.per_page || 50,
      };
      
      if (params.status) {
        apiParams.status = params.status;
      }
      
      if (params.category_id) {
        apiParams.category_id = params.category_id;
      }
      
      if (params.search) {
        apiParams.search = params.search;
      }
      
      console.log("Fetching fees with params:", apiParams);
      
      const response = await apiService.get<PaginatedResponse<any>>(
        this.feesEndpoint,
        { params: apiParams }
      );
      
      console.log("Fees API response:", response);
      
      const fees = response.results || [];
      console.log(`Found ${fees.length} fee records`);
      
      if (fees.length > 0) {
        console.log("First fee structure:", fees[0]);
      }
      
      const processedFees: FeeDropdownOption[] = [];
      
      for (const fee of fees) {
        const feeId = fee.id;
        
        if (!feeId || isNaN(parseInt(feeId.toString()))) {
          console.warn(`Invalid fee ID:`, feeId, "Full fee:", fee);
          continue;
        }
        
        const student = fee.student || {};
        const studentId = student.s_studentID || `ID-${student.id || 'N/A'}`;
        let studentName = `${student.s_fname || ''} ${student.s_lname || ''}`.trim();
        if (student.s_suffix && student.s_suffix.trim()) {
          studentName += ` ${student.s_suffix}`;
        }
        
        const categoryName = fee.category_name || 'Others';
        const categoryId = fee.category_id || params.category_id || 1;
        
        const totalAmount = parseFloat(fee.total_amount || "0");
        const amount = Math.abs(totalAmount);
        const balance = parseFloat(fee.balance || amount.toString());
        
        const label = `${studentId} - ${studentName} - ${categoryName} (₱${amount.toFixed(2)})`;
        
        processedFees.push({
          value: feeId,
          label: label,
          studentId: studentId,
          studentName: studentName,
          amount: amount,
          category: categoryName,
          category_id: categoryId,
          category_name: categoryName,
          dueDate: fee.due_date,
          status: fee.status || 'pending',
          balance: balance,
          feeData: fee,
          id: feeId,
        });
      }
      
      console.log(`Processed ${processedFees.length} fees`);
      
      return processedFees;
      
    } catch (error: any) {
      console.error("Error fetching fees:", error);
      return [];
    }
  }

  async getFeeById(feeId: number): Promise<Fee | null> {
    return fetchFeeDetails(feeId);
  }

  async getPaymentSubmissionById(id: number): Promise<PaymentSubmissionResponse | null> {
    return fetchPaymentSubmission(id);
  }

  async createSinglePayment(data: CreatePaymentDto): Promise<ApiResponse<Transaction>> {
    try {
      console.log("Creating single payment:", data);
      
      const response = await apiService.post<PaymentApiResponse>(
        this.paymentsEndpoint, 
        data
      );
      
      if (!response) {
        throw new Error("No data in response");
      }
      
      cache.feeDetails.delete(data.fee);
      
      const transaction = await mapPaymentToTransaction(response);
      
      return {
        status_code: 201,
        message: "Payment created successfully",
        data: transaction,
        errors: null
      };
    } catch (error: any) {
      console.error("Error creating payment:", error);
      throw error;
    }
  }

  async createBulkPayments(data: BulkPaymentsDto): Promise<ApiResponse<{ payments: PaymentApiResponse[] }>> {
    try {
      console.log("Creating bulk payments:", data);
      
      if (!data.payments || data.payments.length === 0) {
        throw new Error("No payments to create");
      }
      
      const invalidPayments = data.payments.filter(p => !p.fee || isNaN(p.fee));
      if (invalidPayments.length > 0) {
        throw new Error(`Invalid fee IDs in payments: ${invalidPayments.map(p => p.fee).join(', ')}`);
      }
      
      const createdPayments: PaymentApiResponse[] = [];
      
      for (const payment of data.payments) {
        try {
          const response = await apiService.post<PaymentApiResponse>(
            this.paymentsEndpoint,
            payment
          );
          createdPayments.push(response);
          
          cache.feeDetails.delete(payment.fee);
        } catch (error) {
          console.error(`Error creating payment for fee ${payment.fee}:`, error);
          throw error;
        }
      }
      
      return {
        status_code: 201,
        message: "Payments created successfully",
        data: { payments: createdPayments },
        errors: null
      };
    } catch (error: any) {
      console.error("Error creating bulk payments:", error);
      throw error;
    }
  }

  async updatePayment(id: string, data: Partial<CreatePaymentDto>): Promise<ApiResponse<Transaction>> {
    try {
      const response = await apiService.patch<PaymentApiResponse>(
        `${this.paymentsEndpoint}${id}/`, 
        data
      );
      
      if (data.fee) {
        cache.feeDetails.delete(data.fee);
      }
      
      const transaction = await mapPaymentToTransaction(response);
      
      return {
        status_code: 200,
        message: "Payment updated successfully",
        data: transaction,
        errors: null
      };
    } catch (error) {
      console.error("Error updating payment:", error);
      throw error;
    }
  }

  async getById(id: string): Promise<ApiResponse<Transaction>> {
    try {
      const response = await apiService.get<PaymentApiResponse>(
        `${this.paymentsEndpoint}${id}/`
      );
      const transaction = await mapPaymentToTransaction(response);
      
      return {
        status_code: 200,
        message: "Success",
        data: transaction,
        errors: null
      };
    } catch (error) {
      console.error("Error fetching transaction:", error);
      throw error;
    }
  }

  async getStatistics(): Promise<ApiResponse<{
    sentCount: number;
    paidCount: number;
    overdueCount: number;
    pendingSubmissions: number;
    approvedSubmissions: number;
    rejectedSubmissions: number;
  }>> {
    try {
      const response = await this.getAll({ per_page: 100 });
      const transactions = response.data.results;
      
      const sent = transactions.filter((t) => t.status === "sent");
      const paid = transactions.filter((t) => t.status === "paid");
      const overdue = transactions.filter((t) => t.status === "overdue");
      
      const pendingSubmissions = transactions.filter((t) => t.paymentSubmissionStatus === "pending").length;
      const approvedSubmissions = transactions.filter((t) => t.paymentSubmissionStatus === "approved").length;
      const rejectedSubmissions = transactions.filter((t) => t.paymentSubmissionStatus === "rejected").length;

      return {
        status_code: 200,
        message: "Success",
        data: {
          sentCount: sent.length,
          paidCount: paid.length,
          overdueCount: overdue.length,
          pendingSubmissions,
          approvedSubmissions,
          rejectedSubmissions
        },
        errors: null
      };
    } catch (error) {
      console.error("Error fetching statistics:", error);
      return {
        status_code: 500,
        message: "Error fetching statistics",
        data: { 
          sentCount: 0, 
          paidCount: 0, 
          overdueCount: 0,
          pendingSubmissions: 0,
          approvedSubmissions: 0,
          rejectedSubmissions: 0
        },
        errors: error instanceof Error ? [error.message] : ["Unknown error"]
      };
    }
  }

  async markAsPaid(id: string, paymentMethod: "cash" | "gcash" | "bank" | "online" | "other" = "cash"): Promise<ApiResponse<Transaction>> {
    return this.updatePayment(id, { payment_method: paymentMethod });
  }

  async updatePaymentSubmissionStatus(id: number, status: PaymentSubmissionStatus, remarks?: string): Promise<ApiResponse<PaymentSubmissionResponse>> {
    try {
      const updateData: any = { status };
      if (remarks) {
        updateData.remarks = remarks;
      }
      
      const response = await apiService.patch<PaymentSubmissionResponse>(
        `${this.paymentSubmissionsEndpoint}${id}/`,
        updateData
      );
      
      return {
        status_code: 200,
        message: "Payment submission updated successfully",
        data: response,
        errors: null
      };
    } catch (error) {
      console.error(`Error updating payment submission ${id} status:`, error);
      throw error;
    }
  }

  async createMultiplePayments(payments: CreatePaymentDto[]): Promise<ApiResponse<{ payments: PaymentApiResponse[] }>> {
    if (payments.length === 1) {
      const response = await this.createSinglePayment(payments[0]);
      return {
        ...response,
        data: { payments: [{
          id: parseInt(response.data?.id || "0"),
          fee: { id: payments[0].fee } as any,
          amount_paid: payments[0].amount_paid,
          payment_method: payments[0].payment_method,
          payment_submission: payments[0].payment_submission || null,
          created_at: new Date().toISOString(),
          received_by: {
            id: 0,
            username: "",
            email: "",
            first_name: "",
            last_name: ""
          },
          updated_at: ""
        }] }
      };
    } else {
      return this.createBulkPayments({ payments });
    }
  }

  clearCache(): void {
    cache.clear();
  }

  async searchFees(searchTerm: string, page: number = 1, perPage: number = 20): Promise<FeeDropdownOption[]> {
    return this.getFees({
      search: searchTerm,
      per_page: perPage
    });
  }
}

export default new TransactionsApi();