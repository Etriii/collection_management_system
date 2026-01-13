// stores/students.ts

import { defineStore } from "pinia"
import { type FeeEntity, type PaymentEntity, type PaymentSubmissionEntity, type StudentEntity, type StudentFilters } from "@pages/students/domain/entities/StudentEntities"
import { type PaginatedApiResnpose } from "@core/types"
import { getStudentsApi, getStudentApi, getStudentFeesApi, getStudentPaymentsApi, getStudentSubmissionsApi } from "@pages/students/data/api/students_api"

export const useStudentsStore = defineStore("students", {
  state: () => ({
    // Paginated response
    studentsResponse: null as PaginatedApiResnpose<StudentEntity> | null,
    loadingList: false,

    // Pagination
    currentPage: 1,
    perPage: 10,
    search: "",
    filters: {} as StudentFilters,
    ordering: "s_lname",

    // Selected student
    studentsById: {} as Record<number, StudentEntity>,
    selectedStudent: null as StudentEntity | null,
    loadingStudent: false,
    selectedStudentId: null as number | null,



    //  per-student financial data cache
    studentFinancials: {} as Record<number, {
      fees: FeeEntity[];
      payments: PaymentEntity[];
      submissions: PaymentSubmissionEntity[];
    }>,
    loadingFinancials: false,
  }),

  // get sa mga stats :>
  getters: {
    selectedStudent: (state) => {
      if (!state.selectedStudentId) return null
      return state.studentsById[state.selectedStudentId] ?? null
    },
    totalFeeAmount: (state) => {
      return Object.values(state.studentFinancials)
        .flatMap(financial => financial.fees)
        .reduce((total, fee) => total + Number(fee.total_amount), 0)
    },
    totalFeePaid: (state) => {
      return Object.values(state.studentFinancials).flatMap(financial => financial.fees).reduce((total, fee) => total + (Number(fee.total_amount ?? 0) - Number(fee.balance ?? 0)), 0)
    },
    totalFeeBalance: (state) => {
      return Object.values(state.studentFinancials).flatMap(financial => financial.fees).reduce((total, fee) => total + (Number(fee.balance ?? 0)), 0)
    }, pendingFees: (state) => {
      return Object.values(state.studentFinancials)
        .flatMap(financial => financial.fees)
        .filter(fee => fee.status === "pending")
    }
  },

  actions: {
    async fetchStudents() {
      this.loadingList = true
      try {
        this.studentsResponse = await getStudentsApi({
          page: this.currentPage,
          per_page: this.perPage,
          search: this.search || undefined,
          ordering: this.ordering,
          filters: this.filters,
        })
      } finally {
        this.loadingList = false
      }
    },

    // async fetchStudent(id: number) {
    //   this.loadingStudent = true
    //   try {
    //     const res = await getStudentApi(id)
    //     this.selectedStudent = res.data
    //   } finally {
    //     this.loadingStudent = false
    //   }
    // },
    async fetchStudent(id: number) {
      if (this.studentsById[id]) {
        this.selectedStudentId = id
        return
      }

      this.loadingStudent = true
      try {
        const res = await getStudentApi(id)
        this.studentsById[id] = res.data
        this.selectedStudentId = id
      } finally {
        this.loadingStudent = false
      }
    },
    async fetchStudentFinancials(studentId: number) {
      if (this.studentFinancials[studentId]) return

      this.loadingFinancials = true
      try {
        const [feesRes, paymentsRes, submissionsRes] = await Promise.all([
          getStudentFeesApi(studentId),
          getStudentPaymentsApi(studentId),
          getStudentSubmissionsApi(studentId),
        ])

        this.studentFinancials[studentId] = {
          fees: feesRes.data,
          payments: paymentsRes.data,
          submissions: submissionsRes.data,
        }
      } finally {
        this.loadingFinancials = false
      }
    },

    getSelectedStudentFinancials() {
      if (!this.selectedStudent) return null
      return this.studentFinancials[this.selectedStudent.id] ?? null
    },

    setPage(page: number) {
      this.currentPage = page
      this.fetchStudents()
    },

    setSearch(search: string) {
      this.search = search
      this.currentPage = 1
      this.fetchStudents()
    },

    setFilters(filters: StudentFilters) {
      this.filters = filters
      this.currentPage = 1
      this.fetchStudents()
    },

    clearSelectedStudent() {
      this.selectedStudent = null
    },
  },
})
