import type { FeeFilter } from "@pages/fees/fee_filter";
import type { PaymentFilter } from "@pages/transactions/presentation/payment_filters";

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
            perPage: 5,
            search: "",
            filters: {} as FeeFilter,
        },
        loading: false,
        fetched: false,
    },
});



export const createStudentFinancialPaymentsCache = () => ({
    payments: {
        data: {
            current_page: 1,
            per_page: 5,
            total_pages: 0,
            total_items: 0,
            data: []
        },
        params: {
            currentPage: 1,
            perPage: 5,
            search: "",
            filters: {} as PaymentFilter,
        },
        loading: false,
        fetched: false,
    },

});


export const createStudentFinancialPaymentSubmissionsCache = () => ({
    submissions: {
        data: {
            current_page: 1,
            per_page: 5,
            total_pages: 0,
            total_items: 0,
            data: []
        },
        params: {
            currentPage: 1,
            perPage: 5,
            search: "",
            filters: {} as PaymentFilter,
        },
        loading: false,
        fetched: false,
    },
});
