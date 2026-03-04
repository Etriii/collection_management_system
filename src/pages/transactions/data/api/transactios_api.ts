import apiv2 from "@services/apiServicev2"
import api from "@services/apiServicev2"
import type { ApiResponse } from "@core/types"
import type { BulkPaymentPayload, PaymentEntity } from "@pages/transactions/domain/payments_entities"
import { ENDPOINTS } from "@core/url_paths"

export async function bulkCreatePayments(payload: BulkPaymentPayload, cancel_key: string): Promise<ApiResponse<{ message: string, count: number }>> {
    try {
        return await apiv2.post<Promise<ApiResponse<{ message: string, count: number }>>>(ENDPOINTS.payments + 'bulk/', { 'payments': payload }, cancel_key);
    } catch (e: any) {
        throw new Error(e.response?.errors || "Bulk Payments creation failed");
    }
}

export async function fetchPayment(id: number): Promise<ApiResponse<PaymentEntity>> {
    try {
        return await api.get<Promise<ApiResponse<PaymentEntity>>>(`${ENDPOINTS.payments}${id}/`);
    } catch (e: any) {
        throw new Error(e.response?.errors || `Failed to fetch Fee id: ${id}`);
    }
}