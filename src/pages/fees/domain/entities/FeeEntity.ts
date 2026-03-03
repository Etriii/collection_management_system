import type { CollectionCategorySlimEntity } from "@pages/collections/domain/entity/CollectionCategoryEntity"
import type { Semester } from "@pages/students/domain/entities/StudentEntities"
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
  | "paid"
  | "waived"
  | "overdue";


export interface FeeSlimEntity {
id: number;
  student: StudentMiniEntity;
  category_id: number;
  category_name: string;
  total_amount: number; 
  balance: string;
  status: FeeStatus;
  due_date: string; 
  issued_by: string;
  remarks: string;
  academic_year: string;
  semester: Semester;
}


export interface FeeDetailedEntity {
  id: number;
  student: StudentMiniEntity;
  category: CollectionCategorySlimEntity;
  issued_by: string;
  total_amount: number;
  balance: number;
  status: FeeStatus;
  due_date: string;
  remarks: string;
  academic_year: string;
  semester: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
}

export  interface FeeReadItems {//For Payment Submssion fee item
  id: number;
  category_id: string;
  category_name: string;
  total_amount: number; 
  balance: number;
  status: FeeStatus;
  due_date: string; 
}



//  FEE ATTENDANCE DEAILS
export interface IAttendanceRecord {
  id: number;
  updated_by: string;
  morning_check_in: string | null;
  morning_check_out: string | null;
  afternoon_check_in: string | null;
  afternoon_check_out: string | null;
  total_fines: string; 
  date: string;
}

export interface IEventAttendance {
  event_name: string;
  attendance_records: IAttendanceRecord[];
  grand_fee_total: number;
  has_record: boolean;
  message: string;
}