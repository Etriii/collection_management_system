import api from '@services/apiService'
import { type ApiResponse } from '@core/types'
import { type DetailedPaymentSubmissionEntity } from '@pages/gcashpayments/domain/entities/PaymentSubmissionEntity'
import { ENDPOINTS } from '@core/url_paths'

export async function fetchPaymentSubmissionApi(id: number): Promise<ApiResponse<DetailedPaymentSubmissionEntity>> {
    try {
        const response = await api.get<ApiResponse<DetailedPaymentSubmissionEntity>>(`${ENDPOINTS.paymentSubmissions}${id}`)

        if (response.status_code !== 200 || response.errors) {
            throw new Error(response.message || "Failed to load Payment Submission")
        }
        return response
    } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to load Payment Submission")
    }
}   