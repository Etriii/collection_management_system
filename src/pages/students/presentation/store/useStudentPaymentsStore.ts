// stores/students.ts
import { defineStore } from "pinia";
import { reactive, } from "vue";
import { getStudentPaymentsApi,  } from "@pages/students/data/api/students_api";//getStudentSubmissionsApi

// import { useDebounce } from "@utils/composables/useDebounc";
// import { cancelPreviousRequest } from "@utils/cancenllationRequest";
import { createStudentFinancialPaymentsCache } from "./utils/createStudentFinancialCache";
import { type PaginatedApiResponse } from "@core/types";
import type { PaymentFilter } from "@pages/transactions/presentation/payment_filters";
import type { PaymentEntity } from "@pages/transactions/domain/payments_entities";
// const { debounce } = useDebounce();

export const useStudentsPaymentsStore = defineStore("students_financial_payments", () => {

    const caches = reactive({
        studentPayments: {} as Record<number, {
            payments: {
                data: PaginatedApiResponse<PaymentEntity>;
                params: {
                    currentPage: number;
                    perPage: number;
                    search: string;
                    filters: PaymentFilter,
                };
                loading: boolean;
                fetched: boolean
            };
        }>,
    });

    // GETTERS
    const getStudentPaymentsCache = (id: number) => {
        if (!caches.studentPayments[id]) {
            caches.studentPayments[id] = createStudentFinancialPaymentsCache();
        }
        return caches.studentPayments[id];
    };
    // ACTIONS

    const fetchStudentPayments = async (student_id: number, force = false) => {
        const cache = getStudentPaymentsCache(student_id).payments;

        if (!force && cache.fetched) return cache;
        
        cache.fetched = false;
        cache.loading = true;
        try {
            const data = await getStudentPaymentsApi(student_id, {
                current_page: cache.params.currentPage,
                per_page: cache.params.perPage,
                search: cache.params.search,
                filters: cache.params.filters,
            });
            cache.data = data
            cache.fetched = true;
        } finally {
            cache.loading = false;
        }

        return cache;
    }


    const setPage = (student_id: number, page: number,) => {
        getStudentPaymentsCache(student_id).payments.params.currentPage = page;
        fetchStudentPayments(student_id, true);
        // debounce(() => fetchStudents(true), 1000);
    };

    const setPerPage = (student_id: number, perPage: number) => {
        getStudentPaymentsCache(student_id).payments.params.perPage = perPage;
        getStudentPaymentsCache(student_id).payments.params.currentPage = 1;
        fetchStudentPayments(student_id, true);
    }

    // const setSearch = (search: string) => {
    //   students.params.search = search;
    //   students.params.currentPage = 1;
    //   debounce(() => fetchStudents(true), 1000);
    // };

    // const setFilters = (filters: StudentFilters) => {
    //   students.params.filters = filters;
    //   students.params.currentPage = 1;
    //   fetchStudents(true);
    // };

    return {caches,
        getStudentPaymentsCache, fetchStudentPayments, setPage, setPerPage
    };
});
