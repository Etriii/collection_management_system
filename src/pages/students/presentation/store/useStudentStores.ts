// stores/students.ts
import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import type { FeeEntity, PaymentEntity, PaymentSubmissionEntity, StudentEntity, StudentFilters } from "@pages/students/domain/entities/StudentEntities";
import type { PaginatedApiResnpose } from "@core/types";
import { getStudentsApi, getStudentApi, getStudentSummaryFees, getStudentFeesApi, getStudentPaymentsApi, getStudentSubmissionsApi } from "@pages/students/data/api/students_api";

import { useDebounce } from "@utils/composables/useDebounc";
import { cancelPreviousRequest } from "@utils/cancenllationRequest";
import { createStudentFinancialCache } from "./createStudentFinancialCache";
const { debounce } = useDebounce();

export const useStudentsStore = defineStore("students", () => {
  const students = reactive({
    data: null as PaginatedApiResnpose<StudentEntity> | null,
    loading: false,
    fetched: false,
    params: {
      currentPage: 1,
      perPage: 10,
      search: "",
      filters: {} as StudentFilters,
    },
  });

  const selectedStudent = reactive({
    id: null as number | null,
    loading: false
  });

  const caches = reactive({
    studentsById: {} as Record<number, StudentEntity>,
    studentFinancials: {} as Record<number, {
      fees_summary: {
        total_amount: number;
        total_balance: number;
        loading: boolean;
        fetched: boolean
        //  I THINK IS SHOULD ADD PARAMS HERE TO FILTER CURRENT SCHOOL YEAR LEVEL AND SEMESTER
      };
      fees: {
        data: FeeEntity[];
        params: {
          currentPage: number;
          perPage: number;
          search: string;
        };
        loading: boolean;
        fetched: boolean
      };
      payments: {
        data: PaymentEntity[];
        params: {
          currentPage: number;
          perPage: number;
          search: string;
        };
        loading: boolean;
        fetched: boolean
      };
      submissions: {
        data: PaymentSubmissionEntity[];
        params: {
          currentPage: number;
          perPage: number;
          search: string;
        };
        loading: boolean;
        fetched: boolean
      };
    }>,
  });

  /*** GETTERS ***/
  const getSelectedStudent = computed(() => {
    if (!selectedStudent.id) return null;
    return caches.studentsById[selectedStudent.id] ?? null;
  });
  const getStudentFinancialCache = (id: number) => {
    return (
      caches.studentFinancials[id] ??
      (caches.studentFinancials[id] = createStudentFinancialCache())
    );
  };
  /*** ACTIONS ***/
  const fetchStudents = async (force = false) => {
    if (students.fetched && !force) return

    cancelPreviousRequest();

    students.loading = true;
    try {
      students.data = await getStudentsApi({
        current_page: students.params.currentPage,
        per_page: students.params.perPage,
        search: students.params.search || undefined,
        filters: students.params.filters,
      });
      students.fetched = true
    } finally {
      students.loading = false;
    }
  };

  const fetchStudent = async (id: number) => {
    if (caches.studentsById[id]) {
      selectedStudent.id = id;
      return;
    }
    selectedStudent.loading = true;
    try {
      const res = await getStudentApi(id);
      caches.studentsById[id] = res.data;
      selectedStudent.id = id;
    } finally {
      selectedStudent.loading = false;
    }
  };

  const fetchStudentSummaryFees = async (id: number, force = false) => {
    const cache = getStudentFinancialCache(id).fees_summary;

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


  const setPage = (page: number) => {
    students.params.currentPage = page;
    fetchStudents(true)
    // debounce(() => fetchStudents(true), 1000);
  };

  const setPerPage = (perPage: number = 10) => {
    students.params.perPage = perPage;
    fetchStudents(true)
  }

  const setSearch = (search: string) => {
    students.params.search = search;
    students.params.currentPage = 1;
    debounce(() => fetchStudents(true), 1000);
  };

  const setFilters = (filters: StudentFilters) => {
    students.params.filters = filters;
    students.params.currentPage = 1;
    fetchStudents(true);
  };

  const clearSelectedStudent = () => {
    selectedStudent.id = null;
    selectedStudent.loading = false;
  };

  return {
    students, selectedStudent, getSelectedStudent, caches, fetchStudents, fetchStudent, setPage, setPerPage, setSearch, setFilters, clearSelectedStudent, fetchStudentSummaryFees,getStudentFinancialCache
  };
});
