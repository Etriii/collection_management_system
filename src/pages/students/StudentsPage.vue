<script setup lang="ts">
import { ref, computed } from 'vue';
import { Plus, Search, Users } from 'lucide-vue-next';
import ViewStudent from './ViewStudent.vue';
import StudentModals from '/src/components/modals/StudentModals.vue';

import { STUDENT_STATUSES, type StudentStatus } from '@core/constants';

interface Student {
    id: number;
    student_id: string;
    fullname: string;
    set: string;
    status: StudentStatus;
}

interface NewStudent {
    student_id: string;
    fullname: string;
    set: string;
    status: StudentStatus;
}

const currentPage = ref(1);
const perPage = ref(10);

const handlePageChange = (page: number) => {
    currentPage.value = page;
}

// Test data
const testData = ref<Student[]>([
    { id: 1, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 2, student_id: '2001-00013', fullname: 'Maria Santos', set: 'BSIT 3B', status: 'enrolled' },
    { id: 3, student_id: '2001-00014', fullname: 'Juan Dela Cruz', set: 'BSCS 2A', status: 'graduated' },
    { id: 4, student_id: '2001-00015', fullname: 'Ana Reyes', set: 'BSIT 4A', status: 'dropped' },
    { id: 5, student_id: '2001-00016', fullname: 'Pedro Garcia', set: 'BSIT 4A', status: 'enrolled' },
]);

const searchQuery = ref("");
const activeFilter = ref<"all" | StudentStatus>("all");
const isCreateStudentDialogOpen = ref(false);
const selectedStudent = ref<Student | null>(null);
const showViewStudent = ref(false);
const isEditStudentDialogOpen = ref(false);
const isDeleteConfirmOpen = ref(false);

const editStudentData = ref<NewStudent>({
    student_id: "",
    fullname: "",
    set: "",
    status: "enrolled",
});

const filteredStudents = computed(() =>
    testData.value.filter((student) => {
        const q = searchQuery.value.toLowerCase();
        const matchesSearch =
            student.student_id.toLowerCase().includes(q) ||
            student.fullname.toLowerCase().includes(q) ||
            student.set.toLowerCase().includes(q);
        const matchesFilter =
            activeFilter.value === "all" || student.status === activeFilter.value;
        return matchesSearch && matchesFilter;
    })
);

const totalPages = computed(() => {
    return Math.ceil(filteredStudents.value.length / perPage.value);
});

const paginatedStudents = computed(() => {
    const start = (currentPage.value - 1) * perPage.value;
    const end = start + perPage.value;
    return filteredStudents.value.slice(start, end);
});

function handleCreateStudent(student: NewStudent) {
    const newId = testData.value.length > 0 ? Math.max(...testData.value.map(s => s.id)) + 1 : 1;
    const newStudentRecord: Student = {
        id: newId,
        ...student
    };
    testData.value.push(newStudentRecord);
    isCreateStudentDialogOpen.value = false;
}

function handleEditStudent(student: Student) {
    editStudentData.value = {
        student_id: student.student_id,
        fullname: student.fullname,
        set: student.set,
        status: student.status,
    };
    isEditStudentDialogOpen.value = true;
}

function handleUpdateStudent(updatedData: NewStudent) {
    if (!selectedStudent.value) return;

    const index = testData.value.findIndex(s => s.id === selectedStudent.value!.id);
    if (index !== -1) {
        testData.value[index] = {
            ...testData.value[index],
            ...updatedData
        };
        selectedStudent.value = testData.value[index];
    }
    isEditStudentDialogOpen.value = false;
}

function handleDeleteStudent() {
    if (!selectedStudent.value) return;

    testData.value = testData.value.filter(s => s.id !== selectedStudent.value!.id);
    showViewStudent.value = false;
    selectedStudent.value = null;
    isDeleteConfirmOpen.value = false;
}

function handleRowClick(student: Student) {
    selectedStudent.value = student;
    showViewStudent.value = true;
}

function handleBackFromView() {
    showViewStudent.value = false;
    selectedStudent.value = null;
}

function handleDeleteClick(student: Student) {
    isDeleteConfirmOpen.value = true;
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
                            <tr v-if="paginatedStudents.length === 0">
                                <td colspan="5" class="px-6 py-16 text-center text-gray-500">
                                    <Users class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                    <p class="text-xl font-medium text-gray-700 mb-2">No students found</p>
                                    <p class="text-sm text-gray-500">Adjust your search or create a new student record.
                                    </p>
                                </td>
                            </tr>
                            <tr v-for="student in paginatedStudents" :key="student.id" @click="handleRowClick(student)"
                                class="hover:bg-blue-50 transition-colors duration-150 cursor-pointer">
                                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ student.id
                                    }}</td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ student.student_id }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ student.fullname }}
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ student.set }}</td>
                                <td class="px-6 py-4 whitespace-nowrap">
                                    <span class="px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full" :class="{
                                        'bg-emerald-100 text-emerald-800': student.status === 'enrolled',
                                        'bg-red-100 text-red-800': student.status === 'dropped',
                                        'bg-amber-100 text-amber-800': student.status === 'graduated',
                                    }">
                                        {{ student.status.charAt(0).toUpperCase() + student.status.slice(1) }}
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
                        <span class="font-medium">{{ Math.min(currentPage * perPage, filteredStudents.length) }}</span>
                        of <span class="font-medium">{{ filteredStudents.length }}</span> entries
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
        v-model:isDeleteOpen="isDeleteConfirmOpen" :editData="editStudentData" @create="handleCreateStudent"
        @update="handleUpdateStudent" @delete="handleDeleteStudent" />
</template>