import api from '@services/apiService'
import { type ApiResponse } from '@core/types'
import type { DashboardResponse } from '../domain/entitites/dashboard_entities'
import { ENDPOINTS } from '@core/url_paths'

export async function getAdminDashboardAPI(academic_year: string, semester: string): Promise<DashboardResponse> {
    try {
        const response = await api.get<ApiResponse<DashboardResponse>>(`${ENDPOINTS.summaries}admin-dashboard/`, { 'academic_year': academic_year, 'semester': semester })
        return response.data
    } catch (e: any) {
        throw new Error(e.response?.data?.message || "Failed to load fee")
    }
}