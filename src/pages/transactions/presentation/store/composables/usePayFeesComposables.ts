import type { BulkPaymentPayload } from "@pages/transactions/domain/payments_entities"
import { bulkCreatePayments } from "@pages/transactions/data/api/transactios_api"
import { useAlertStore } from "@stores/ui/alert"
import { ref } from "vue"
import apiServicev2 from "@services/apiServicev2"
import { useStudentsFeesStore } from "@pages/students/presentation/store/useStudentFeeslStore"
import { useStudentsStore } from "@pages/students/presentation/store/useStudentStores"
import { useStudentsPaymentsStore } from "@pages/students/presentation/store/useStudentPaymentsStore"
export function usePayFees() {
    const { getSelectedStudent: student } = useStudentsStore()
    const { fetchStudentFees } = useStudentsFeesStore()
    const { fetchStudentPayments } = useStudentsPaymentsStore()

    const alert = useAlertStore()
    const loading = ref<boolean>(false)
    const cancel_payment_key = "create_pending_fees_payment"

    const cancel_payment_request = () => {
        alert.show("Request Cancelled", "success")
        apiServicev2.cancel(cancel_payment_key)
    }

    async function payPendingFeesBulk(bulkPaymentLoad: BulkPaymentPayload) {
        try {
            loading.value = true
            console.log(bulkPaymentLoad)
            const response = await bulkCreatePayments(bulkPaymentLoad, cancel_payment_key);
            // E reload og fetch ang mga fees
            alert.show(` ${response.data.message} : Created ${response.data.count} payments`, "success")
            loading.value = false
            if (student?.id) {
                fetchStudentFees(student.id, true)
                fetchStudentPayments(student.id, true)
            }
        } catch (e: any) {
            if (e.isAutoCancel) {
                return;
            }
            alert.show("Failed to create Bulk Payments", "error")
            loading.value = false
            throw Error("Failed to create Bulk Payments: " + e.error)
        }
    }

    return { payPendingFeesBulk, loading, cancel_payment_request }
}