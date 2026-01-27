export const createStudentFinancialCache = () => ({
    fees_summary: {
        total_amount: 0,
        total_balance: 0,
        loading: false,
        fetched: false,
    },
    fees: {
        data: [],
        params: {
            currentPage: 1,
            perPage: 10,
            search: "",
        },
        loading: false,
        fetched: false,
    },
    payments: {
        data: [],
        params: {
            currentPage: 1,
            perPage: 10,
            search: "",
        },
        loading: false,
        fetched: false,
    },
    submissions: {
        data: [],
        params: {
            currentPage: 1,
            perPage: 10,
            search: "",
        },
        loading: false,
        fetched: false,
    },
});
