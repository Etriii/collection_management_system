import type { PaymentEntity } from "@pages/transactions/domain/payments_entities";
import { useAlertStore } from "@stores/ui/alert";
import { ref } from "vue";
import { fetchPayment as fetchPaymentAPI } from "@pages/transactions/data/api/transactios_api";

export function usePayment() {
    const payment = ref<PaymentEntity>()
    const loading = ref<boolean>(false)

    const alert = useAlertStore()

    async function fetchPayment(id: number) {
        try {
            loading.value = true
            const response = await fetchPaymentAPI(id)
            payment.value = response.data
            loading.value = false
        } catch (e) {
            loading.value = false
            alert.show(`Failed to fetch payment id: ${id}`)
        }

    }

    return { payment, loading, alert, fetchPayment }
} 