import { ref } from "vue";
import { type DetailedPaymentSubmissionEntity } from "@pages/gcashpayments/domain/entities/PaymentSubmissionEntity";
import { useAlertStore } from "@stores/ui/alert";
import { fetchPaymentSubmissionApi } from "@pages/gcashpayments/data/api/PaymentSubmissionsApi";

export function usePaymentSubmission() {
    const paymentSubmission = ref<DetailedPaymentSubmissionEntity>()
    const loading = ref<boolean>(false)
    const alert = useAlertStore()

    async function fetchPaymentSubmission(id: number) {
        try {
            loading.value = true
            const response = await fetchPaymentSubmissionApi(id)
            if (response.status_code != 200) {
                alert.show("Failed to load Payment Submission", "error")
                loading.value = false
            }
            paymentSubmission.value = response.data
            loading.value = false
        } catch (e: any) {
            alert.show("Failed to load Payment Submission", "error")
            loading.value = false
        }
    }

    return {loading, paymentSubmission, fetchPaymentSubmission}
}