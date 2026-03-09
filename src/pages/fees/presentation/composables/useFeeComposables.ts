import { getFeeApi, getFeeAttendanceDetailsApi } from "@pages/fees/data/api/fees_api";
import { type FeeDetailedEntity, type IEventAttendance } from "@pages/fees/domain/entities/FeeEntity";
import { useAlertStore } from "@stores/ui/alert";
import { ref } from "vue";
import { computed } from "vue"
import { useFeesStore } from "../store/fees.store"

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

export function useFeeAttendanceDetails() {
    const alert = useAlertStore()

    const loading = ref<boolean>(false)
    const attendance_details = ref<IEventAttendance>()

    async function fetchAttendanceDetails(fee_id: number) {
        try {
            loading.value = true
            const response = await getFeeAttendanceDetailsApi(fee_id)
            loading.value = false
            attendance_details.value = response.data
        } catch (e) {
            loading.value = false
            alert.show("Error Fetching Attendance Details", "error")
        }
    }

    return { loading, attendance_details, fetchAttendanceDetails }
}

export function useFeesInfiniteScroll() {
  const store = useFeesStore()

  const hasMore = computed(() => {
    return store.currentPage <= store.totalPages
  })

  const loadMore = async () => {
    if (!hasMore.value) return
    await store.fetchFees(true)
  }

  return {
    store,
    loadMore,
    hasMore
  }
}