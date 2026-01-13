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
id: number,
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

export interface CreateTransactionDto {
  fee: number;
  amount_paid: string;
  payment_method: "cash" | "gcash" | "bank" | "online" | "other";
  payment_submission?: number | null;
}

export interface PaymentApiResponse {
  id: number;
  fee: {
    student: {
      id?: number;
      s_studentID?: string;
      s_fname: string;
      s_mname: string;
      s_lvl: number;
      s_lname: string;
      s_suffix: string;
      s_email: string;
      s_set: string;
    };
    category?: {
      id: number;
      category_name: string;
    };
    total_amount: string;
    balance: string;
    status: string;
    due_date: string;
    issued_by: number;
    remarks: string;
    academic_year: string;
    semester: string;
  };
  received_by: {
    id: number;
    username: string;
    email: string;
    first_name: string;
    last_name: string;
    institute: {
      id: number;
      institute_name: string;
      school_id: number;
      school_name: string;
      school_short_name: string;
    };
  };
  created_at: string;
  updated_at: string;
  amount_paid: string;
  payment_method: string;
  updated_by: number | null;
  payment_submission: number | null;
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
  current_page: number;
  per_page: number;
  total_pages: number;
  total_items: number;
  data: T[];
}

let allCategoriesCache: Map<number, string> | null = null;

async function fetchStudentDetails(studentId: number): Promise<any | null> {
  try {
    const response = await apiService.get<ApiResponse<any>>(
      `api/v1/students/${studentId}/`
    );
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching student details ${studentId}:`, error);
    return null;
  }
}

async function fetchFeeDetails(feeId: number): Promise<Fee | null> {
  try {
    if (!feeId || isNaN(feeId)) {
      console.error("Invalid feeId:", feeId);
      return null;
    }
    
    const response = await apiService.get<ApiResponse<Fee>>(
      `api/v1/fees/${feeId}/`
    );
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching fee details ${feeId}:`, error);
    return null;
  }
}

async function fetchPaymentSubmission(id: number): Promise<PaymentSubmissionResponse | null> {
  try {
    const response = await apiService.get<ApiResponse<PaymentSubmissionResponse>>(
      `api/v1/payment_submissions/${id}/`
    );
    return response.data || null;
  } catch (error) {
    console.error(`Error fetching payment submission ${id}:`, error);
    return null;
  }
}

async function mapPaymentToTransaction(payment: PaymentApiResponse): Promise<Transaction> {
  console.log("Mapping payment to transaction - full object:", payment);
  
  const student = payment.fee.student;
  const fullName = `${student.s_fname} ${student.s_mname} ${student.s_lname} ${student.s_suffix}`.trim();
  
  let studentId = "";
  let category: TransactionCategory = "Others";
  let feeId: number | undefined = undefined;
  let paymentSubmissionStatus: PaymentSubmissionStatus | undefined = undefined;
  
  if (payment.payment_submission) {
    console.log("Payment has payment_submission ID:", payment.payment_submission);
    const paymentSubmission = await fetchPaymentSubmission(payment.payment_submission);
    
    if (paymentSubmission) {
      console.log("Payment submission found:", paymentSubmission);
      
      feeId = paymentSubmission.fee;
      console.log("Got fee ID from payment submission:", feeId);
      
      paymentSubmissionStatus = paymentSubmission.status as PaymentSubmissionStatus;
      console.log("Got payment submission status:", paymentSubmissionStatus);
      
      const studentDetails = await fetchStudentDetails(paymentSubmission.student);
      if (studentDetails) {
        studentId = studentDetails.s_studentID;
        console.log("Got student ID from student details:", studentId);
      } 
    }
  }
  
  if (feeId && !isNaN(feeId)) {
    console.log("Fetching fee details for fee ID:", feeId);
    const feeDetails = await fetchFeeDetails(feeId);
    
    if (feeDetails) {
      if (!studentId) {
        studentId = feeDetails.student.s_studentID || "";
        console.log("Got student ID from fee details:", studentId);
      }
      
      const categoryName = feeDetails.category?.category_name || "";
      console.log("Got category from fee details:", categoryName);
      
      if (categoryName.toLowerCase().includes('locker')) {
        category = "Locker";
      } else if (categoryName.toLowerCase().includes('shirt') || categoryName.toLowerCase().includes('t-shirt')) {
        category = "T-Shirt";
      } else if (categoryName.toLowerCase().includes('attendance')) {
        category = "Attendance Fees";
      } else if (categoryName.toLowerCase().includes('others') || categoryName === "Others") {
        category = "Others";
      }
    }
  }
  
  if (!studentId && student.s_studentID) {
    studentId = student.s_studentID;
    console.log("Found student ID in payment response:", studentId);
  }
  
  if (!studentId) {
    studentId = "";
  }
  
  if (category === "Others") {
    if (payment.fee.category?.category_name) {
      const categoryName = payment.fee.category.category_name;
      if (categoryName.toLowerCase().includes('locker')) {
        category = "Locker";
      } else if (categoryName.toLowerCase().includes('shirt') || categoryName.toLowerCase().includes('t-shirt')) {
        category = "T-Shirt";
      } else if (categoryName.toLowerCase().includes('attendance')) {
        category = "Attendance Fees";
      }
    } else {
      const remarks = payment.fee.remarks?.toLowerCase() || "";
      if (remarks.includes('shirt') || remarks.includes('tshirt') || remarks.includes('t-shirt')) {
        category = "T-Shirt";
      } else if (remarks.includes('attendance') || remarks.includes('fee')) {
        category = "Attendance Fees";
      } else if (remarks.includes('locker')) {
        category = "Locker";
      }
    }
  }
  
  let status: TransactionStatus = "sent";
  const amountPaid = parseFloat(payment.amount_paid || "0");
  const totalAmount = parseFloat(payment.fee.total_amount || "0");
  const balance = parseFloat(payment.fee.balance || "0");
  
  if (balance <= 0 || payment.fee.status === "paid") {
    status = "paid";
  } else if (new Date(payment.fee.due_date) < new Date() && balance > 0) {
    status = "overdue";
  } else if (amountPaid > 0 && amountPaid < totalAmount) {
    status = "sent";
  }
  
  if (paymentSubmissionStatus === "rejected") {
    status = "sent"; 
  }
  
  return {
    id: payment.id.toString(),
    transactionNumber: `TRN-${payment.id.toString().padStart(8, '0')}`,
    studentId: studentId,
    student: fullName,
    category,
    amount: amountPaid,
    dueDate: payment.fee.due_date.split('T')[0],
    status,
    paymentSubmissionStatus, 
    received_by: payment.received_by?.username,
    payment_method: payment.payment_method,
    created_at: payment.created_at,
    fee_id: feeId,
    payment_submission_id: payment.payment_submission || undefined
  };
}

async function getAllCategories(): Promise<Map<number, string>> {
  if (allCategoriesCache) {
    return allCategoriesCache;
  }
  
  try {
    console.log("Fetching all collection categories...");
    
    const response = await apiService.get<any>('/api/v1/collection-categories/');
    console.log("Categories API response:", response);
    
    let categories = [];
    
    if (response.data && Array.isArray(response.data)) {
      categories = response.data;
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      categories = response.data.data;
    } else if (response.data?.results && Array.isArray(response.data.results)) {
      categories = response.data.results;
    }
    
    console.log(`Loaded ${categories.length} collection categories`);
    console.log("Categories data:", categories);
    
    allCategoriesCache = new Map();
    categories.forEach((category: any) => {
      if (category.id !== undefined && category.name) {
        allCategoriesCache!.set(category.id, category.name);
      } else if (category.id !== undefined && category.category_name) {
        allCategoriesCache!.set(category.id, category.category_name);
      }
    });
    
    console.log("Category map created with", allCategoriesCache.size, "entries");
    
    if (allCategoriesCache.size === 0) {
      console.warn("No categories loaded. Check API endpoint and response structure.");
    }
    
    return allCategoriesCache;
    
  } catch (error) {
    console.error("Error fetching collection categories:", error);
    
    if (error.response) {
      console.error("Error response:", error.response.data);
      console.error("Error status:", error.response.status);
    }
    
    return new Map();
  }
}
class TransactionsApi {
  private paymentsEndpoint = "api/v1/payments/";
  private feesEndpoint = "api/v1/fees/";
  private paymentSubmissionsEndpoint = "api/v1/payment_submissions/";
  private studentsEndpoint = "api/v1/students/";


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
        current_page: params.current_page,
        per_page: params.per_page,
        search: params.search,
        student_id: params.student_id,

      };
      
      const response = await apiService.get<ApiResponse<PaginatedResponse<PaymentApiResponse>>>(
        this.paymentsEndpoint, 
        backendParams
      );
      
      console.log("Payments API response structure:", response);
      
      if (!response.data?.data) {
        console.error("No data in payments response");
        return {
          ...response,
          data: {
            current_page: 1,
            per_page: 10,
            total_pages: 1,
            total_items: 0,
            data: []
          }
        };
      }
      
      const transactionsPromises = response.data.data.map(payment => 
        mapPaymentToTransaction(payment)
      );
      
      let transactions = await Promise.all(transactionsPromises);
      
      if (params.payment_submission_status) {
        transactions = transactions.filter(transaction => 
          transaction.paymentSubmissionStatus === params.payment_submission_status
        );
        console.log(`Filtered to ${transactions.length} transactions with payment submission status: ${params.payment_submission_status}`);
      }
      
      if (params.status && params.status !== "all") {
        transactions = transactions.filter(transaction => 
          transaction.status === params.status
        );
        console.log(`Filtered to ${transactions.length} transactions with status: ${params.status}`);
      }
      
      return {
        ...response,
        data: {
          current_page: response.data?.current_page || 1,
          per_page: response.data?.per_page || 10,
          total_pages: response.data?.total_pages || 1,
          total_items: transactions.length,
          data: transactions
        }
      };
    } catch (error) {
      console.error("Error fetching transactions:", error);
      return {
        status_code: 500,
        message: "Error fetching transactions",
        data: {
          current_page: 1,
          per_page: 10,
          total_pages: 1,
          total_items: 0,
          data: []
        },
        errors: error instanceof Error ? [error.message] : ["Unknown error"]
      };
    }
  }


async getFees(params: {
  search?: string;
  student_id?: string;
//   status?: string;
  status?: string | string[];
  per_page?: number;
  category_id?: number;
} = {}): Promise<FeeDropdownOption[]> {
  try {
    console.log("Fetching fees with params:", params);
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const apiParams: any = {
      student_id: params.student_id,
      per_page: params.per_page || 50,
      status: params.status || 'pending'
    };
    
    if (params.category_id) {
      apiParams.category_id = params.category_id;
    }
    
    if (params.search) {
      apiParams.search = params.search;
    }
    
    console.log("Fetching fees with params:", apiParams);
    
    const response = await apiService.get<any>(
      this.feesEndpoint,
      apiParams
    );
    
    console.log("Fees API RAW response:", JSON.stringify(response, null, 2));
    
    let fees = [];
    
    if (response.data?.data?.data && Array.isArray(response.data.data.data)) {
      fees = response.data.data.data;
      console.log("Found fees in response.data.data.data");
    } else if (response.data?.data && Array.isArray(response.data.data)) {
      fees = response.data.data;
      console.log("Found fees in response.data.data");
    } else if (Array.isArray(response.data)) {
      fees = response.data;
      console.log("Found fees in response.data");
    } else if (response.data && typeof response.data === 'object') {
      const keys = Object.keys(response.data);
      for (const key of keys) {
        if (Array.isArray(response.data[key])) {
          fees = response.data[key];
          console.log(`Found fees in response.data.${key}`);
          break;
        }
      }
    }
    
    console.log(`Found ${fees.length} fee records`);
    
    if (fees.length > 0) {
      console.log("First fee raw structure:", JSON.stringify(fees[0], null, 2));
    }
    
    const processedFees: FeeDropdownOption[] = [];
    
    for (let i = 0; i < fees.length; i++) {
      const fee = fees[i];
      
      const feeId = fee.id; 
      
      console.log(`Processing fee ${i + 1}: ID = ${feeId}, Type: ${typeof feeId}`);
      
      if (!feeId || isNaN(parseInt(feeId))) {
        console.warn(`Invalid fee ID for fee ${i + 1}:`, feeId, "Full fee:", fee);
      }
      
      let categoryName = 'Others';
      let categoryId = params.category_id || 1;
      
      if (fee.category) {
        if (typeof fee.category === 'object') {
          categoryName = fee.category.category_name || fee.category.name || 'Others';
          categoryId = fee.category.id || fee.category.category_id || categoryId;
        } else if (typeof fee.category === 'string') {
          categoryName = fee.category;
        }
      }
      
      if (categoryName === 'Others') {
        const categories = await getAllCategories();
        if (categories.has(categoryId)) {
          categoryName = categories.get(categoryId)!;
        }
      }
      
      const totalAmount = parseFloat(fee.total_amount || "0");
      const amount = Math.abs(totalAmount);
      const balance = parseFloat(fee.balance || amount.toString());
      
      let studentId = "Unknown";
      let studentName = "Unknown Student";
      
      if (fee.student) {
        const email = fee.student.s_email || "";
        studentId = email.split('@')[0] || `STU-${i}`;
        
        studentName = `${fee.student.s_fname || ''} ${fee.student.s_lname || ''}`.trim();
        if (fee.student.s_suffix && fee.student.s_suffix.trim()) {
          studentName += ` ${fee.student.s_suffix}`;
        }
      }
      
      const label = `${studentId} - ${studentName} - ${categoryName} (₱${amount.toLocaleString()})`;
      
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
        fee_id: feeId 
      });
    }
    
    console.log(`Processed ${processedFees.length} fees with IDs:`, 
      processedFees.map(f => ({ value: f.value, id: f.id, hasFeeData: !!f.feeData }))
    );
    
    return processedFees;
    
  } catch (error: any) {
    console.error("Error fetching fees:", error);
    return [];
  }
}

  async getFeeById(feeId: number): Promise<Fee | null> {
    try {
      const response = await apiService.get<ApiResponse<Fee>>(`${this.feesEndpoint}${feeId}/`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching fee ${feeId}:`, error);
      return null;
    }
  }

  async getPaymentSubmissionById(id: number): Promise<PaymentSubmissionResponse | null> {
    try {
      const response = await apiService.get<ApiResponse<PaymentSubmissionResponse>>(
        `${this.paymentSubmissionsEndpoint}${id}/`
      );
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching payment submission ${id}:`, error);
      return null;
    }
  }


  async getPaymentSubmissions(params: {
    status?: PaymentSubmissionStatus;
    student_id?: string;
    per_page?: number;
  } = {}): Promise<PaymentSubmissionResponse[]> {
    try {
      const response = await apiService.get<ApiResponse<PaginatedResponse<PaymentSubmissionResponse>>>(
        this.paymentSubmissionsEndpoint,
        params
      );
      
      return response.data?.data || [];
    } catch (error) {
      console.error("Error fetching payment submissions:", error);
      return [];
    }
  }

  async getStudentById(id: number): Promise<any | null> {
    try {
      const response = await apiService.get<ApiResponse<any>>(
        `${this.studentsEndpoint}${id}/`
      );
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching student ${id}:`, error);
      return null;
    }
  }

  async searchFees(searchTerm: string): Promise<FeeDropdownOption[]> {
    return this.getFees({
      search: searchTerm,
      per_page: 20
    });
  }

async create(data: CreateTransactionDto): Promise<ApiResponse<Transaction>> {
  try {
    console.log("Creating payment with data:", data);
    console.log("API Endpoint:", this.paymentsEndpoint);
    
    if (!data.fee || isNaN(data.fee)) {
      throw new Error(`Invalid fee ID: ${data.fee}`);
    }
    
    const response = await apiService.post<ApiResponse<any>>(
      this.paymentsEndpoint, 
      {
        fee: data.fee,
        amount_paid: data.amount_paid,
        payment_method: data.payment_method,
        payment_submission: data.payment_submission || null
      }
    );
    
    console.log("Payment created successfully:", response);
    
    if (!response.data) {
      throw new Error("No data in response");
    }
    
    let paymentData = response.data;
    
    if (response.data.data && typeof response.data.data === 'object') {
      paymentData = response.data.data;
    }
    
    if (!paymentData.fee || typeof paymentData.fee === 'number') {
      console.log("Payment response doesn't have full fee details, fetching...");
      
      const feeId = typeof paymentData.fee === 'number' ? paymentData.fee : data.fee;
      
      const fullPaymentResponse = await apiService.get<ApiResponse<PaymentApiResponse>>(
        `${this.paymentsEndpoint}${paymentData.id || paymentData.fee}/`
      );
      
      if (fullPaymentResponse.data) {
        paymentData = fullPaymentResponse.data;
      } else {
        console.log("Creating mock payment object for transaction mapping");
        
        const feeDetails = await this.getFeeById(feeId);
        if (!feeDetails) {
          throw new Error(`Could not fetch fee details for fee ID: ${feeId}`);
        }
        
        const mockPayment: PaymentApiResponse = {
          id: paymentData.id || 0,
          fee: {
            student: {
              s_fname: feeDetails.student?.s_fname || "",
              s_mname: feeDetails.student?.s_mname || "",
              s_lname: feeDetails.student?.s_lname || "",
              s_suffix: feeDetails.student?.s_suffix || "",
              s_email: feeDetails.student?.s_email || "",
              s_set: feeDetails.student?.s_set || "",
              s_lvl: feeDetails.student?.s_lvl || 0,
              s_studentID: feeDetails.student?.s_studentID || "",
              id: feeDetails.student?.id || 0
            },
            category: feeDetails.category,
            total_amount: feeDetails.total_amount,
            balance: feeDetails.balance,
            status: feeDetails.status,
            due_date: feeDetails.due_date,
            issued_by: feeDetails.issued_by,
            remarks: feeDetails.remarks,
            academic_year: feeDetails.academic_year,
            semester: feeDetails.semester
          },
          received_by: {
            id: 0,
            username: "system",
            email: "",
            first_name: "",
            last_name: "",
            institute: {
              id: 0,
              institute_name: "",
              school_id: 0,
              school_name: "",
              school_short_name: ""
            }
          },
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          amount_paid: data.amount_paid,
          payment_method: data.payment_method,
          updated_by: null,
          payment_submission: data.payment_submission || null
        };
        
        paymentData = mockPayment;
      }
    }
    
    const transaction = await mapPaymentToTransaction(paymentData);
    
    return {
      ...response,
      data: transaction
    };
  } catch (error: any) {
    console.error("Error creating transaction:", error);
    
    if (error.response) {
      console.error("Response error:", error.response.data);
      console.error("Response status:", error.response.status);
      console.error("Response headers:", error.response.headers);
    }
    
    if (error instanceof Error) {
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
    throw error;
  }
}

  async getById(id: string): Promise<ApiResponse<Transaction>> {
    try {
      const response = await apiService.get<ApiResponse<PaymentApiResponse>>(
        `${this.paymentsEndpoint}${id}/`
      );
      const transaction = await mapPaymentToTransaction(response.data!);
      
      return {
        ...response,
        data: transaction
      };
    } catch (error) {
      console.error("Error fetching transaction:", error);
      throw error;
    }
  }

  async update(id: string, data: Partial<CreateTransactionDto>): Promise<ApiResponse<Transaction>> {
    try {
      const response = await apiService.patch<ApiResponse<PaymentApiResponse>>(
        `${this.paymentsEndpoint}${id}/`, 
        data
      );
      
      const transaction = await mapPaymentToTransaction(response.data!);
      
      return {
        ...response,
        data: transaction
      };
    } catch (error) {
      console.error("Error updating transaction:", error);
      throw error;
    }
  }

 
//   async delete(id: string): Promise<ApiResponse<void>> {
//     return await apiService.delete<ApiResponse<void>>(`${this.paymentsEndpoint}${id}/`);
//   }

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
      const transactions = response.data.data;
      
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
    try {
      const current = await this.getById(id);
      
      return await this.update(id, {
        payment_method: paymentMethod,
      });
    } catch (error) {
      console.error("Error marking as paid:", error);
      throw error;
    }
  }

  async updatePaymentSubmissionStatus(id: number, status: PaymentSubmissionStatus, remarks?: string): Promise<ApiResponse<PaymentSubmissionResponse>> {
    try {
      const updateData: any = { status };
      if (remarks) {
        updateData.remarks = remarks;
      }
      
      const response = await apiService.patch<ApiResponse<PaymentSubmissionResponse>>(
        `${this.paymentSubmissionsEndpoint}${id}/`,
        updateData
      );
      
      return response;
    } catch (error) {
      console.error(`Error updating payment submission ${id} status:`, error);
      throw error;
    }
  }

  async getFeesWithIds(): Promise<FeeDropdownOption[]> {
    try {
      const allFees = await this.getFees({ per_page: 100 });
      
      return allFees;
    } catch (error) {
      console.error("Error getting fees with IDs:", error);
      return [];
    }
  }

}

export default new TransactionsApi();