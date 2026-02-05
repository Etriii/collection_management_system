// stores/students.ts
import { defineStore } from "pinia";
import { ref, reactive, computed } from "vue";
import type { StudentEntity, StudentFilters } from "@pages/students/domain/entities/StudentEntities";
import type { PaginatedApiResponse } from "@core/types";
import { getStudentsApi, getStudentApi } from "@pages/students/data/api/students_api";

import { useDebounce } from "@utils/composables/useDebounc";
import { cancelPreviousRequest } from "@utils/cancenllationRequest";
const { debounce } = useDebounce();

export const useStudentsStore = defineStore("students", () => {
  const students = reactive({
    data: null as PaginatedApiResponse<StudentEntity> | null,
    loading: false,
    fetched: false,
    params: {
      currentPage: 1,
      perPage: 5,
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
  });

  /*** GETTERS ***/
  const getSelectedStudent = computed(() => {
    if (!selectedStudent.id) return null;
    return caches.studentsById[selectedStudent.id] ?? null;
  });

  /*** ACTIONS ***/
  const fetchStudents = async (force = false) => {
    if (students.fetched && !force) return

    cancelPreviousRequest();

    students.fetched = false;
    students.loading = true;
    try {
      students.data = await getStudentsApi({
        current_page: students.params.currentPage,
        per_page: students.params.perPage,
        search: students.params.search,
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
    debounce(() => fetchStudents(true), 200);
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
    students, selectedStudent, getSelectedStudent, caches, fetchStudents, fetchStudent, setPage, setPerPage, setSearch, setFilters, clearSelectedStudent
  };
});
