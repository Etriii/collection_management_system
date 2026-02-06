// stores/students.ts
import { defineStore } from "pinia";
import { reactive, } from "vue";
import { getStudentSubmissionsApi } from "@pages/students/data/api/students_api";//getStudentSubmissionsApi

// import { useDebounce } from "@utils/composables/useDebounc";
// import { cancelPreviousRequest } from "@utils/cancenllationRequest";
import { type PaginatedApiResponse } from "@core/types";
import type { PaymentFilter } from "@pages/transactions/presentation/payment_filters";
import { createStudentFinancialPaymentSubmissionsCache } from "./utils/createStudentFinancialCache";
import type { PaymentSubmissionEntity } from "@pages/gcashpayments/domain/entities/PaymentSubmissionEntity";
// const { debounce } = useDebounce();

export const useStudentsSubmissionsStore = defineStore("students_financial_submissions", () => {

    const caches = reactive({
        studentSubmissions: {} as Record<number, {
            submissions: {
                data: PaginatedApiResponse<PaymentSubmissionEntity>;
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

    // // GETTERS
    const getStudentPaymentSubmissionsCache = (id: number) => {
        if (!caches.studentSubmissions[id]) {
            caches.studentSubmissions[id] = createStudentFinancialPaymentSubmissionsCache();
        }
        return caches.studentSubmissions[id];
    };
    // ACTIONS
    const fetchStudentPaymentSubmissions = async (student_id: number, force = false) => {
        const cache = getStudentPaymentSubmissionsCache(student_id).submissions;

        if (!force && cache.fetched) return cache;

        cache.fetched = false;
        cache.loading = true;
        try {
            const data = await getStudentSubmissionsApi(student_id, {
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
        getStudentPaymentSubmissionsCache(student_id).submissions.params.currentPage = page;
        fetchStudentPaymentSubmissions(student_id, true);
        // debounce(() => fetchStudents(true), 1000);
    };

    const setPerPage = (student_id: number, perPage: number) => {
        getStudentPaymentSubmissionsCache(student_id).submissions.params.perPage = perPage;
        fetchStudentPaymentSubmissions(student_id, true);
    }

    // // const setSearch = (search: string) => {
    // //   students.params.search = search;
    // //   students.params.currentPage = 1;
    // //   debounce(() => fetchStudents(true), 1000);
    // // };

    // // const setFilters = (filters: StudentFilters) => {
    // //   students.params.filters = filters;
    // //   students.params.currentPage = 1;
    // //   fetchStudents(true);
    // // };

    return {
        caches, fetchStudentPaymentSubmissions,
        getStudentPaymentSubmissionsCache, setPage, setPerPage
        // , fetchStudentPayments
    };
});
