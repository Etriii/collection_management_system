// // stores/students/students.store.ts
// import { defineStore } from "pinia"

// // import { fetchStudentsApi, fetchStudentApi } from "@/api/students.api"
// import { type PaginatedApiResnpose } from "@core/types"
// import type { StudentFilters } from "@pages/students/student_filters"
// import type { StudentEntity } from "@pages/students/domain/entities/StudentEntities"

// export const useStudentsStore = defineStore("students", {
//   state: () => ({
//     // Paginated response 
//     studentsResponse: null as PaginatedApiResnpose<StudentEntity> | null,
//     loadingList: false,
//     // Pagination
//     currentPage: 1,
//     perPage: 10,
//     search: "",
//     filters: {} as StudentFilters,
//     ordering: "id",


//     // Selected student
//     selectedStudent: null as StudentEntity | null,
//     loadingStudent: false,
//   }),

//   getters: {
//     // Just the student list
//     students(state) {
//       return state.studentsResponse?.data ?? []
//     },

//     totalPages(state) {
//       return state.studentsResponse?.total_pages ?? 0
//     },

//     totalItems(state) {
//       return state.studentsResponse?.total_items ?? 0
//     },

//     hasStudents(state) {
//       return (state.studentsResponse?.data.length ?? 0) > 0
//     },
//   },

//   actions: {
//     /* ------------------------------
//      * LIST STUDENTS
//      * ------------------------------ */
//     async fetchStudents() {
//       this.loadingList = true
//       try {
//         const params = {
//           current_page: this.currentPage,
//           per_page: this.perPage,
//           search: this.search || undefined,
//           ordering: this.ordering,
//           ...this.filters,
//         }

//         const res = await fetchStudentsApi(params)
//         this.studentsResponse = res.data
//       } finally {
//         this.loadingList = false
//       }
//     },

//     /* ------------------------------
//      * SINGLE STUDENT
//      * ------------------------------ */
//     async fetchStudent(id: number) {
//       this.loadingStudent = true
//       try {
//         const res = await fetchStudentApi(id)
//         this.selectedStudent = res.data
//       } finally {
//         this.loadingStudent = false
//       }
//     },

//     setSelectedStudent(student: Student | null) {
//       this.selectedStudent = student
//     },

//     setPage(page: number) {
//       this.currentPage = page
//       this.fetchStudents()
//     },

//     setPerPage(perPage: number) {
//       this.perPage = perPage
//       this.currentPage = 1
//       this.fetchStudents()
//     },
//     setSearch(search: string) {
//       this.search = search
//       this.currentPage = 1
//       this.fetchStudents()
//     },

//     setFilters(filters: StudentFilters) {
//       this.filters = filters
//       this.currentPage = 1
//       this.fetchStudents()
//     },

//     clearFilters() {
//       this.filters = {}
//       this.currentPage = 1
//       this.fetchStudents()
//     },

//     resetStore() {
//       this.studentsResponse = null
//       this.selectedStudent = null
//       this.search = ""
//       this.filters = {}
//       this.currentPage = 1
//       this.perPage = 10
//     },
//   },
// })
