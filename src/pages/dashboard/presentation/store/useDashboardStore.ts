import { defineStore } from "pinia"
import { ref } from "vue"
import { type DashboardResponse } from "@pages/dashboard/domain/entitites/dashboard_entities"
import { getAdminDashboardAPI } from "@pages/dashboard/data/dashboardAPI"

export const useDashboardStore = defineStore("dashboard", () => {
    const stats = ref<DashboardResponse>({
        students_count: 0,
        total_amount: 0,
        total_balance: 0,
        overdue_count: 0,
        collection_rate: 0,
        pending_submissions_counst: 0,
        recent_transactions: [],
        collection_rate_per_categories: []
    })
    const loading = ref(false)
    const fetched = ref(false)

    const academicYear = ref<string>("2024-2025")
    const semester = ref<string>("1st")

    async function fetchDashboard() {
        try {

            loading.value = true

            const data = await getAdminDashboardAPI(
                academicYear.value,
                semester.value,
            )

            stats.value = data
            fetched.value = true

        } catch (e: any) {
            console.error("Dashboard fetch failed:", e)
        } finally {
            loading.value = false
        }
    }

    function setFilters(year: string, sem: string) {
        if (academicYear.value === year && semester.value === sem) return

        academicYear.value = year
        semester.value = sem

        fetchDashboard()
    }

    return {
        stats,
        loading,
        fetched,
        academicYear,
        semester,
        fetchDashboard,
        setFilters
    }
})