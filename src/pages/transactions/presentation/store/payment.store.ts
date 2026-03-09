import { defineStore } from "pinia"
import { ref } from "vue"
import api from "@services/apiService"
import { ENDPOINTS } from "@core/url_paths"
import type { ApiResponse, PaginatedApiResponse } from "@core/types"
import type { PaymentEntity } from "@pages/transactions/domain/payments_entities"

export const usePaymentsStore = defineStore("payments", () => {
    const payments = ref<PaymentEntity[]>([])

    const currentPage = ref(1)
    const perPage = ref(10)
    const totalPages = ref(1)

    const loading = ref(false)
    const fetched = ref(false)
    const filters = ref({
        academic_year: "",
        semester: ""
    })

    const fetchPayments = async (force = false) => {
        if (fetched.value && !force) return
        if (loading.value) return
        if (currentPage.value > totalPages.value) return

        loading.value = true

        try {
            const res = await api.get<ApiResponse<PaginatedApiResponse<PaymentEntity>>>(ENDPOINTS.payments, {
                current_page: currentPage.value,
                per_page: perPage.value,
                // academic_year: filters.value.academic_year,
                // semester: filters.value.semester
            }
            )

            const response = res.data

            payments.value.push(...response.data)

            currentPage.value = response.current_page + 1
            totalPages.value = response.total_pages
            fetched.value = true
        } catch (err) {
            console.error(err)
        } finally {
            loading.value = false
        }
    }

    const resetPayments = () => {
        payments.value = []
        currentPage.value = 1
        totalPages.value = 0
    }

    const applyFilters = async (academic_year: string, semester: string) => {
        filters.value.academic_year = academic_year
        filters.value.semester = semester

        resetPayments()
        await fetchPayments()
    }

    return {
        payments,
        loading,
        currentPage,
        totalPages,
        filters,
        fetchPayments,
        applyFilters,
        resetPayments
    }
})