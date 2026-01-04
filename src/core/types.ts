export interface ApiResponse<T> {
  status_code: number
  message: string
  data: T
  errors: Record<string, string[]> | null
}

export interface PaginatedApiResnpose<T> {
  current_page: number
  per_page: number
  total_pages: number
  total_items: number
  data: T[];
}
