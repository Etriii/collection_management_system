// stores/students.ts
import { defineStore } from "pinia";
import { reactive, } from "vue";
import { getStudentsApi, getStudentApi, getStudentSummaryFees, getStudentFeesApi, getStudentPaymentsApi, getStudentSubmissionsApi } from "@pages/students/data/api/students_api";

// import { useDebounce } from "@utils/composables/useDebounc";
// import { cancelPreviousRequest } from "@utils/cancenllationRequest";
import { createStudentFinancialCache } from "./utils/createStudentFinancialCache";
import { type FeeFilter } from "@pages/fees/fee_filter";
import type { FeeEntity } from "@pages/fees/domain/entities/FeeEntity";
import { type PaginatedApiResponse } from "@core/types";
// const { debounce } = useDebounce();

export const useStudentsFeesStore = defineStore("students_financial", () => {

  const caches = reactive({
    studentFees: {} as Record<number, {
      fees_summary: {
        total_amount: number;
        total_balance: number;
        loading: boolean;
        fetched: boolean
        //  I THINK IS SHOULD ADD PARAMS HERE TO FILTER CURRENT SCHOOL YEAR LEVEL AND SEMESTER
      };
      fees: {
        data: PaginatedApiResponse<FeeEntity>;
        params: {
          currentPage: number;
          perPage: number;
          search: string;
          filters: FeeFilter,
        };
        loading: boolean;
        fetched: boolean
      };

      // payments: {
      //   data: PaymentEntity[];
      //   params: {
      //     currentPage: number;
      //     perPage: number;
      //     search: string;
      //   };
      //   loading: boolean;
      //   fetched: boolean
      // };
      // submissions: {
      //   data: PaymentSubmissionEntity[];
      //   params: {
      //     currentPage: number;
      //     perPage: number;
      //     search: string;
      //   };
      //   loading: boolean;
      //   fetched: boolean
      // };
    }>,
  });

  // GETTERS
  const getStudentFeesCache = (id: number) => {
    if (!caches.studentFees[id]) {
      caches.studentFees[id] = createStudentFinancialCache();
    }
    return caches.studentFees[id];
  };

  // ACTIONS
  const fetchStudentSummaryFees = async (id: number, force = false) => {
    const cache = getStudentFeesCache(id).fees_summary;

    if (!force && cache.fetched) return cache;

    cache.loading = true;
    try {
      const data = await getStudentSummaryFees(id);
      cache.total_amount = data.total_amount;
      cache.total_balance = data.total_balance;
      cache.fetched = true;
    } finally {
      cache.loading = false;
    }

    return cache;
  };

  const fetchStudentFees = async (student_id: number, force = false) => {
    const cache = getStudentFeesCache(student_id).fees;

    if (!force && cache.fetched) return cache;

    cache.loading = true;
    try {
      const data = await getStudentFeesApi(student_id, {
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


  // const setPage = (page: number) => {
  //   students.params.currentPage = page;
  //   fetchStudents(true)
  //   // debounce(() => fetchStudents(true), 1000);
  // };

  // const setPerPage = (perPage: number = 10) => {
  //   students.params.perPage = perPage;
  //   fetchStudents(true)
  // }

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

  // const clearSelectedStudent = () => {
  //   selectedStudent.id = null;
  //   selectedStudent.loading = false;
  // };

  return {
    caches,
    fetchStudentSummaryFees, getStudentFeesCache, fetchStudentFees
  };
});
