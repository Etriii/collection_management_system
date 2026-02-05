import type { FeeEntity } from "@pages/fees/domain/entities/FeeEntity"

export interface StudentEntity {
  id: number
  s_studentID: string
  s_rfid?: string | null
  s_fname: string
  s_mname?: string | null
  s_lname: string
  s_suffix?: string | null
  // s_email: string
  s_set?: string | null
  s_lvl: number
  s_status: string
  s_image?: string | null
  program_name: string
  created_at: string
  updated_at: string
}

export interface StudentMiniEntity {
  id: number,
  full_name: string,
  program_name: string,
  s_set: string,
  s_lvl: number
}

export interface Program {
  name: string
}

export interface StudentFilters {
  program_id?: number
  s_status?: string
  s_lvl?: number
}

export type Semester = "first" | "second";


export interface StudentData {
  fees: FeeEntity[];
  payments: PaymentEntity[];
  submissions: PaymentSubmissionEntity[];
}


export interface StudentSummaryFeesResponse {
  student_id: number;
  total_amount: number;
  total_balance: number;
}

export interface GeneratedFeeBatchEntity {
  id: number
  category_id: number
  institute_id: number
  academic_year: string
  semester: Semester
  generated_by_id?: number | null

  created_at: string
  updated_at: string
}


export type PaymentMethod =
  | "cash"
  | "gcash"
  | "bank"
  | "online"
  | "other"


export interface PaymentEntity {
  id: number

  fee_id: number
  amount_paid: string
  payment_method: PaymentMethod

  received_by_id?: number | null
  payment_submission_id?: number | null

  created_at: string
  updated_at: string
}



export type SubmissionStatus =
  | "pending"
  | "approved"
  | "rejected"


export interface PaymentSubmissionEntity {
  id: number

  student_id: number
  fee_id: number

  screenshot: any[]
  amount_paid: string
  reference_number: string

  status: SubmissionStatus

  reviewed_by_id?: number | null
  reviewed_at?: string | null
  remarks?: string | null

  created_at: string
  updated_at: string
}
