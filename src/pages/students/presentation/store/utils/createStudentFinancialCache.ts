import type { FeeFilter } from "@pages/fees/fee_filter";

export const createStudentFinancialCache = () => ({
    fees_summary: {
        total_amount: 0,
        total_balance: 0,
        loading: false,
        fetched: false,
    },
    fees: {
        data: {
            current_page: 1,
            per_page: 10,
            total_pages: 0,
            total_items: 0,
            data: []
        },
        params: {
            currentPage: 1,
            perPage: 10,
            search: "",
            filters: {} as FeeFilter,
        },
        loading: false,
        fetched: false,
    },
    // payments: {
    //     data: [],
    //     params: {
    //         currentPage: 1,
    //         perPage: 10,
    //         search: "",
    //     },
    //     loading: false,
    //     fetched: false,
    // },
    // submissions: {
    //     data: [],
    //     params: {
    //         currentPage: 1,
    //         perPage: 10,
    //         search: "",
    //     },
    //     loading: false,
    //     fetched: false,
    // },
});
