export interface Student {
  id: number
  full_name: string
  program_name: string
  s_set: string
  s_lvl: number
}

export interface Fee {
  id: number
  student: Student
  category_id: string
  category_name: string
  total_amount: string
  balance: string
  status: string
  due_date: string
}

export interface RecentTransaction {
  id:number,
  fee: Fee
  received_by: string
  amount_paid: string
  payment_method: string
  updated_at: string
}

export interface DashboardResponse {
  students_count: number
  overdue_count: number
  total_amount: number
  total_balance: number
  collection_rate: number
  pending_submissions_count: number
  recent_transactions: RecentTransaction[]
  collection_rate_per_categories: {
    category_name: string
    collection_rate: number
    overdue_count: number
  }[]
}