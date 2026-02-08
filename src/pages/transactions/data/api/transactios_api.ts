import api from "@services/apiServicev2"
import type { ApiResponse, PaginatedApiResponse } from "@core/types"
import type { BulkPaymentPayload } from "@pages/transactions/domain/payments_entities"
import { ENDPOINTS } from "@core/url_paths"

export async function bulkCreatePayments(payload: BulkPaymentPayload, cancel_key: string): Promise<ApiResponse<{ message: string, count: number }>> {
    try {
        return await api.post<Promise<ApiResponse<{ message: string, count: number }>>>(ENDPOINTS.payments + 'bulk/', { 'payments': payload }, cancel_key);
    } catch (e: any) {
        throw new Error(e.response?.errors || "Bulk Payments creation failed");
    }
}