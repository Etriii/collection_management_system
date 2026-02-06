import type {  Semester } from "@pages/students/domain/entities/StudentEntities"
import type { StudentMiniEntity } from "@pages/students/domain/entities/StudentEntities"

export interface FeeEntity {
    id: number
    student: StudentMiniEntity
    category_id: number
    category_name: string

    total_amount: string
    balance: string
    status: FeeStatus

    due_date: string
    issued_by_id?: number | null
    remarks?: string | null

    academic_year: string
    semester: Semester

    batch_id?: number | null

    created_at: string
    updated_at: string
}


export type FeeStatus =
  | "pending"
  | "partial"
  | "paid"
  | "waived"
  | "overdue";


export interface FeeSlimEntity {
  id: number
  student: StudentMiniEntity
  category_id: number
  category_name: string
  total_amount: number
  balance: number
  status: FeeStatus
}