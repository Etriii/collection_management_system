import type { FeeEntity } from "@pages/fees/domain/entities/FeeEntity"
import type { PaymentEntity } from "@pages/transactions/domain/payments_entities"

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


// export interface StudentData {
//   fees: FeeEntity[];
//   payments: PaymentEntity[];
//   submissions: PaymentSubmissionEntity[];
// }


export interface StudentSummaryFeesResponse {
  student_id: number;
  total_amount: number;
  total_balance: number;
}



