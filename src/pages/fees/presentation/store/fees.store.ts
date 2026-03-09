import { getFeeApi, getFeeAttendanceDetailsApi } from "@pages/fees/data/api/fees_api";
import { type FeeDetailedEntity, type FeeSlimEntity, type IEventAttendance } from "@pages/fees/domain/entities/FeeEntity";
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

import { defineStore } from "pinia"
import api from "@services/apiService"
import type { ApiResponse, PaginatedApiResponse } from "@core/types";
import { ENDPOINTS } from "@core/url_paths";

export const useFeesStore = defineStore("fees", () => {
    const fees = ref<any[]>([])

    const currentPage = ref(1)
    const perPage = ref(10)
    const totalPages = ref(1)

    const loading = ref(false)
    const fetched = ref(false)

    const filters = ref({
        academic_year: "",
        semester: ""
    })

    const fetchFees = async (force: boolean = false) => {
        if (fetched.value && !force) return
        if (loading.value) return
        if (currentPage.value > totalPages.value) return

        loading.value = true

        try {
            const response = await api.get<ApiResponse<PaginatedApiResponse<FeeSlimEntity>>>(ENDPOINTS.fees,
                {
                    current_page: currentPage.value,
                    per_page: perPage.value,
                    academic_year: filters.value.academic_year,
                    semester: filters.value.semester
                }
            )

            const data = response.data

            fees.value.push(...data.data)

            currentPage.value = data.current_page + 1
            totalPages.value = data.total_pages
            fetched.value = true;
        } catch (err) {
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    const resetFees = () => {
        fees.value = []
        currentPage.value = 1
        totalPages.value = 0
    }

    const applyFilters = async (academic_year: string, semester: string) => {
        filters.value.academic_year = academic_year
        filters.value.semester = semester

        resetFees()
        await fetchFees(true)
    }

    return {
        fees,
        loading,
        currentPage,
        totalPages,
        filters,
        fetchFees,
        applyFilters,
        resetFees
    }
})