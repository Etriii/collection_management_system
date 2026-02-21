import { getFeeApi } from "@pages/fees/data/api/fees_api";
import { type FeeDetailedEntity } from "@pages/fees/domain/entities/FeeEntity";
import { useAlertStore } from "@stores/ui/alert";
import { ref } from "vue";


export function useFee() {
    const alert = useAlertStore()

    const loading = ref<boolean>(false)
    const fee = ref<FeeDetailedEntity>()

    async function fetchFee(fee_id: number) {
        try {
            loading.value = true
            const response = await getFeeApi(fee_id)
            loading.value = false
            fee.value = response.data
        } catch (e) {
            loading.value = false
            alert.show("Error Fetching Fee", "error")
        }
    }

    return { loading, fee, fetchFee }
}