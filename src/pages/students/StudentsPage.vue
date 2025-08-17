<script setup lang="ts">
import { ref, computed } from 'vue';
import {
    Plus,
    Search,
    Pencil,
    Trash2,
    Users
} from 'lucide-vue-next';

// headers for the datatable
const headers = [
    { name: 'id', title: '#' },
    { name: 'student_id', title: 'Student ID' },
    { name: 'fullname', title: 'Fullname' },
    { name: 'set', title: 'Program/Year/Set' },
    { name: 'status', title: 'Status' },
]

const dummyURL = 'localhost:8000//api/students/'

// const fetchStudents = () => {
//     // fetch students data
// }

/*
the fields and methods below are needed it's because,
we need the values nga gikan sa mga child components sa datatable.
since nag use ug pagination atong backend, so it makes sense na
need nato ug data from the datatable
*/

const currentPage = ref(1);
const perPage = ref(10);

// handels pagination page ex. 1, 2, 3, ...
const handlePageChange = (page: number) => {
    currentPage.value = page;
    // fetch student data
}

const handlePerPageChange = (count: number) => {
    perPage.value = count;
    currentPage.value = 1; // reset to first page
    //   fetch students here

    console.log(count);
}

type StudentStatus = "enrolled" | "inactive" | "pending";

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

// test data only
const testData = ref<Student[]>([
    { id: 1, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 2, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 3, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 4, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 5, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 6, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 7, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 8, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 9, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 10, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 11, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 12, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 13, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 14, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 15, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 16, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 17, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 18, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 19, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 20, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 21, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 22, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 23, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 24, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 25, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 26, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 27, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 28, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 29, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 30, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 31, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 32, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 33, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 34, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 35, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 36, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 37, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 38, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 39, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 40, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 41, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 42, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 43, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 44, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 45, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 46, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 47, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 48, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 49, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 50, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 51, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 52, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 53, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 54, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 55, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 56, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 57, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 58, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 59, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 60, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 61, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 62, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 63, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 64, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 65, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 66, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 67, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 68, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 69, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 70, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 71, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 72, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 73, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 74, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 75, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 76, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 77, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 78, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 79, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 80, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 81, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 82, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 83, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 84, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 85, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 86, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 87, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 88, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 89, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 90, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 91, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 92, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 93, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 94, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 95, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 96, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 97, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 98, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 99, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
    { id: 100, student_id: '2001-00012', fullname: 'Ricardo Marimar', set: 'BSIT 4A', status: 'enrolled' },
]);

const searchQuery = ref("");
const activeFilter = ref<"all" | StudentStatus>("all");
const isCreateStudentDialogOpen = ref(false);

const newStudent = ref<NewStudent>({
    student_id: "",
    fullname: "",
    set: "",
    status: "pending",
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

function handleCreateStudent() {
    if (!newStudent.value.student_id || !newStudent.value.fullname) {
        return;
    }

    const newId = testData.value.length > 0 ? Math.max(...testData.value.map(s => s.id)) + 1 : 1;
    const student: Student = {
        id: newId,
        student_id: newStudent.value.student_id,
        fullname: newStudent.value.fullname,
        set: newStudent.value.set,
        status: newStudent.value.status,
    };

    testData.value.push(student);
    isCreateStudentDialogOpen.value = false;
    newStudent.value = {
        student_id: "",
        fullname: "",
        set: "",
        status: "pending",
    };
}
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <div class="container mx-auto px-4  flex-grow flex flex-col">
            <div class="bg-white rounded-2xl shadow-lg p-6 md:p-8 flex flex-col h-full">

                <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">

                    <header class="mb-8">
                        <h1 class="text-3xl font-bold text-gray-900 leading-tight">Student Records</h1>
                        <p class="text-sm text-gray-500 mt-1">Manage all student information and enrollment statuses.
                        </p>
                    </header>
                    <!-- create student-->
                    <button
                        class="mt-4 sm:mt-0 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-200 ease-in-out transform hover:scale-105 active:scale-100"
                        @click="isCreateStudentDialogOpen = true">
                        <Plus class="mr-2 h-5 w-5" />
                        Create Student
                    </button>
                </div>

                <!-- search and filter-->
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


                <div class="overflow-y-auto flex-grow -mx-6 md:-mx-8 px-6 md:px-8">
                    <table class="min-w-full divide-y divide-gray-200">
                        <thead class="bg-gray-50 sticky top-0">
                            <tr>
                                <th scope="col"
                                    class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    #</th>
                                <th scope="col"
                                    class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Student ID</th>
                                <th scope="col"
                                    class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Full Name</th>
                                <th scope="col"
                                    class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Program/Year/Set</th>
                                <th scope="col"
                                    class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Status</th>
                                <th scope="col"
                                    class="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    Actions</th>
                            </tr>
                        </thead>
                        <tbody class="bg-white divide-y divide-gray-200">
                            <!-- if empty -->
                            <tr v-if="paginatedStudents.length === 0">
                                <td colspan="6" class="px-6 py-16 text-center text-gray-500">
                                    <Users class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                    <p class="text-xl font-medium text-gray-700 mb-2">No students found</p>
                                    <p class="text-sm text-gray-500">Adjust your search or create a new student record.
                                    </p>
                                </td>
                            </tr>
                            <!-- student rows -->
                            <tr v-for="student in paginatedStudents" :key="student.id"
                                class="hover:bg-gray-50 transition-colors duration-150">
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
                                        'bg-red-100 text-red-800': student.status === 'inactive',
                                        'bg-amber-100 text-amber-800': student.status === 'pending',
                                    }">
                                        {{ student.status.charAt(0).toUpperCase() + student.status.slice(1) }}
                                    </span>
                                </td>
                                <td class="px-6 py-4 whitespace-nowrap text-sm">
                                    <div class="flex space-x-2">
                                        <button class="text-blue-500 hover:text-blue-700 transition-colors">
                                            <Pencil class="h-4 w-4" />
                                        </button>
                                        <button class="text-red-500 hover:text-red-700 transition-colors">
                                            <Trash2 class="h-4 w-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                <!-- pagination-->
                <div class="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 flex-shrink-0">
                    <div class="text-sm text-gray-600">
                        Showing <span class="font-medium">{{ (currentPage - 1) * perPage + 1 }}</span> to <span
                            class="font-medium">{{ Math.min(currentPage * perPage, filteredStudents.length) }}</span>
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

        <!-- create student modal-->
        <div v-if="isCreateStudentDialogOpen"
            class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
            <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl transform transition-transform duration-300 scale-95 opacity-0"
                :class="{ 'scale-100 opacity-100': isCreateStudentDialogOpen }">
                <div class="flex justify-between items-center mb-4">
                    <h2 class="text-2xl font-bold text-gray-800">Create New Student</h2>
                    <button @click="isCreateStudentDialogOpen = false"
                        class="text-gray-400 hover:text-gray-600 transition-colors">
                        <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>
                <p class="text-sm text-gray-600 mb-6">Fill in the details to add a new student record.</p>

                <form class="space-y-5" @submit.prevent="handleCreateStudent">
                    <div>
                        <label for="studentId" class="block mb-2 text-sm font-semibold text-gray-700">Student ID</label>
                        <input id="studentId" v-model="newStudent.student_id"
                            class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="2023-0001" required />
                    </div>

                    <div>
                        <label for="studentName" class="block mb-2 text-sm font-semibold text-gray-700">Full
                            Name</label>
                        <input id="studentName" v-model="newStudent.fullname"
                            class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="Juan Dela Cruz" required />
                    </div>

                    <div>
                        <label for="set" class="block mb-2 text-sm font-semibold text-gray-700">Program/Year/Set</label>
                        <input id="set" v-model="newStudent.set"
                            class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                            placeholder="BSIT 4A" required />
                    </div>

                    <div>
                        <label for="status" class="block mb-2 text-sm font-semibold text-gray-700">Status</label>
                        <select id="status" v-model="newStudent.status"
                            class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                            <option value="enrolled">Enrolled</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>

                    <div class="flex justify-end gap-3 pt-4">
                        <button type="button"
                            class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                            @click="isCreateStudentDialogOpen = false">
                            Cancel
                        </button>
                        <button type="submit"
                            class="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200">
                            Create Student
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>
