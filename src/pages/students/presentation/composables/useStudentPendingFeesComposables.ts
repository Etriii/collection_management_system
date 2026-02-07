import type { FeeEntity } from "@pages/fees/domain/entities/FeeEntity";
import { cancelPreviousRequest } from "@utils/cancenllationRequest";
import { ref } from "vue";
import { useAlertStore } from "@stores/ui/alert";
import { getStudentFeesApi } from "@pages/students/data/api/students_api";

export function useStudentPendingFees() {
    const fees = ref<FeeEntity[]>()
    const loading = ref<boolean>(false)

    const alert = useAlertStore()

    async function fetchPendingFees(student_id: number) {
        loading.value = true
        try {
            cancelPreviousRequest()

            const data = await getStudentFeesApi(student_id, {
                per_page: 100,
                current_page: 1,
                filters: {
                    status: "pending"
                },
            });

            fees.value = data.data;
            loading.value = false;
        } catch (e) {
            console.log(e)
            alert.show("Error Fetch Fees Par", "error")
        }
    }


    return {fees, loading, fetchPendingFees}
}