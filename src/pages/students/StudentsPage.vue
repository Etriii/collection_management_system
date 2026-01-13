<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue"
import { Plus, Search, Users } from "lucide-vue-next"

import ViewStudent from "./ViewStudent.vue"
import StudentModals from "/src/components/modals/StudentModals.vue"

import { STUDENT_STATUSES, type StudentStatus } from "@core/constants"
import { useStudentsStore } from "@pages/students/presentation/store/useStudentStores"
import type { StudentEntity } from "@pages/students/domain/entities/StudentEntities"

const studentsStore = useStudentsStore()

const searchQuery = ref("")
const activeFilter = ref<"all" | StudentStatus>("all")

const isCreateStudentDialogOpen = ref(false)
const isEditStudentDialogOpen = ref(false)
const isDeleteConfirmOpen = ref(false)
const showViewStudent = ref(false)

const currentPage = computed({
    get: () => studentsStore.currentPage,
    set: (v) => studentsStore.setPage(v),
})

const perPage = computed(() => studentsStore.perPage)

const students = computed(
    () => studentsStore.studentsResponse?.data ?? []
)

const loadingList = computed(() => studentsStore.loadingList)

const totalPages = computed(
    () => studentsStore.studentsResponse?.total_pages ?? 1
)

const totalItems = computed(
    () => studentsStore.studentsResponse?.total_items ?? 0
)

const selectedStudent = computed({
    get: () => studentsStore.selectedStudent,
    set: (v) => (studentsStore.selectedStudent = v),
})

watch(searchQuery, (q) => {
    studentsStore.setSearch(q)
})

watch(activeFilter, (status) => {
    studentsStore.setFilters({
        s_status: status === "all" ? undefined : status,
    })
})

onMounted(() => {
    studentsStore.fetchStudents()
})

function handleRowClick(student: StudentEntity) {
    studentsStore.fetchStudent(student.id)
    showViewStudent.value = true
}

function handleBackFromView() {
    showViewStudent.value = false
    studentsStore.clearSelectedStudent()
}

function handlePageChange(page: number) {
    if (page < 1 || page > totalPages.value) return
    studentsStore.setPage(page)
}

function handleEditStudent(student: StudentEntity) {
    studentsStore.selectedStudent = student
    isEditStudentDialogOpen.value = true
}

function handleDeleteClick() {
    isDeleteConfirmOpen.value = true
}
</script>


<template>
    <div v-if="!showViewStudent" class="min-h-screen bg-gray-50">
        <div class="container mx-auto px-4 flex-grow flex flex-col">
            <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col h-full">
                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                    <header class="mb-8">
                        <h1 class="text-3xl font-bold text-gray-900 leading-tight">Student Records</h1>
                        <p class="text-sm text-gray-500 mt-1">Manage all student information and enrollment statuses.
                        </p>
                    </header>
                    <button
                        class="mt-4 sm:mt-0 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-100"
                        @click="isCreateStudentDialogOpen = true">
                        <Plus class="mr-2 h-5 w-5" />
                        Create Student
                    </button>
                </div>

                <!-- Search and filter -->
                <div class="flex flex-col md:flex-row items-stretch md:items-center gap-4 mb-6">
                    <div class="flex-1 relative">
                        <Search class="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input v-model="searchQuery"
                            class="pl-12 w-full border-2 border-gray-200 rounded-xl py-3 px-4 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200"
                            placeholder="Search by name, student ID, or program..." />
                    </div>
                    <div class="relative min-w-[150px]">
                        <select v-model="activeFilter"
                            class="block appearance-none w-full bg-white border-2 border-gray-200 text-gray-700 py-3 px-4 pr-10 rounded-xl leading-tight focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors duration-200 cursor-pointer">
                            <option value="all">All Status</option>
                            <option value="enrolled">Enrolled</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                        <div
                            class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                            <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                            </svg>
                        </div>
                    </div>
                </div>

                <!-- Table -->
                <div class="overflow-y-auto flex-grow -mx-6 md:-mx-8 px-6 md:px-8">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50 sticky top-0">
                            <tr>
                                <th
                                    class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    #</th>
                                <th
                                    class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Student ID</th>
                                <th
                                    class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Full Name</th>
                                <th
                                    class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Program/Year/Set</th>
                                <th
                                    class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">

                            <tr v-if="loadingList">
                                <td colspan="5" class=" h-20">
                                    <div class=" animate-spin [animation-duration:3s] text-center">
                                        Ga loading pa
                                    </div>
                                </td>
                            </tr>
                            <tr v-if="students.length === 0 && !loadingList">
                                <td colspan="5" class="px-6 py-16 text-center text-gray-500">
                                    <Users class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                    <p class="text-xl font-medium text-gray-700 mb-2">No students found</p>
                                    <p class="text-sm text-gray-500">Adjust your search or create a new student record.
                                    </p>
                                </td>
                            </tr>

                            <tr v-if="!loadingList" v-for="student in students" :key="student.id"
                                @click="handleRowClick(student)"
                                class="hover:bg-blue-50 transition-colors duration-150 cursor-pointer">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ student.id
                                    }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ student.id }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ student.s_fname + " " +
                                    student.s_mname + " " + student.s_lname }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                                    {{ student.program.name + "-" + student.s_lvl + "" +
                                        student.s_set }}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full" :class="{
                                        'bg-emerald-100 text-emerald-800': student.s_status === 'enrolled',
                                        'bg-red-100 text-red-800': student.s_status === 'dropped',
                                        'bg-amber-100 text-amber-800': student.s_status === 'graduated',
                                    }">
                                        {{ student.s_status.charAt(0).toUpperCase() + student.s_status.slice(1) }}
                                    </span>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- Pagination -->
                <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
                    <div class="text-sm text-gray-600">
                        Showing <span class="font-medium">{{ (currentPage - 1) * perPage + 1 }}</span> to
                        <span class="font-medium">{{ Math.min(currentPage * perPage, students.length) }}</span>
                        of <span class="font-medium">{{ students.length }}</span> entries
                    </div>
                    <div class="flex items-center space-x-2">
                        <button @click="handlePageChange(currentPage - 1)" :disabled="currentPage === 1"
                            class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                            Previous
                        </button>
                        <span class="text-sm font-medium text-gray-700">Page {{ currentPage }} of {{ totalPages
                            }}</span>
                        <button @click="handlePageChange(currentPage + 1)" :disabled="currentPage === totalPages"
                            class="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- View Student -->
    <ViewStudent v-else-if="selectedStudent" :student="selectedStudent" @back="handleBackFromView"
        @edit="handleEditStudent" @delete="handleDeleteClick" />

    <!-- Modals -->
    <StudentModals v-model:isCreateOpen="isCreateStudentDialogOpen" v-model:isEditOpen="isEditStudentDialogOpen"
        v-model:isDeleteOpen="isDeleteConfirmOpen" />

    <!-- :editData="editStudentData" @create="handleCreateStudent"
        @update="handleUpdateStudent" @delete="handleDeleteStudent"  -->
</template>