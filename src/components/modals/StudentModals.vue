<script setup lang="ts">
import { ref, watch } from 'vue';

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

interface Props {
    isCreateOpen?: boolean;
    isEditOpen?: boolean;
    isDeleteOpen?: boolean;
    editData?: NewStudent | null;
}

const props = withDefaults(defineProps<Props>(), {
    isCreateOpen: false,
    isEditOpen: false,
    isDeleteOpen: false,
    editData: null,
});

const emit = defineEmits<{
    'update:isCreateOpen': [value: boolean];
    'update:isEditOpen': [value: boolean];
    'update:isDeleteOpen': [value: boolean];
    'create': [student: NewStudent];
    'update': [student: NewStudent];
    'delete': [];
}>();

const newStudent = ref<NewStudent>({
    student_id: "",
    fullname: "",
    set: "",
    status: "pending",
});

const editStudent = ref<NewStudent>({
    student_id: "",
    fullname: "",
    set: "",
    status: "pending",
});

// Watch for changes in edit data
watch(() => props.editData, (data) => {
    if (data) {
        editStudent.value = { ...data };
    }
}, { immediate: true });

function handleCreate() {
    if (!newStudent.value.student_id || !newStudent.value.fullname) {
        return;
    }
    emit('create', { ...newStudent.value });
    newStudent.value = {
        student_id: "",
        fullname: "",
        set: "",
        status: "pending",
    };
}

function handleUpdate() {
    emit('update', { ...editStudent.value });
}

function handleDelete() {
    emit('delete');
}
</script>

<template>
    <!-- CREATE STUDENT MODAL -->
    <div v-if="isCreateOpen"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 transition-opacity duration-300">
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl transform transition-transform duration-300 scale-95 opacity-0"
            :class="{ 'scale-100 opacity-100': isCreateOpen }">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-800">Create New Student</h2>
                <button @click="emit('update:isCreateOpen', false)"
                    class="text-gray-400 hover:text-gray-600 transition-colors">
                    <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
            <p class="text-sm text-gray-600 mb-6">Fill in the details to add a new student record.</p>

            <form class="space-y-5" @submit.prevent="handleCreate">
                <div>
                    <label for="studentId" class="block mb-2 text-sm font-semibold text-gray-700">Student ID</label>
                    <input id="studentId" v-model="newStudent.student_id"
                        class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        placeholder="2023-0001" required />
                </div>

                <div>
                    <label for="studentName" class="block mb-2 text-sm font-semibold text-gray-700">Full Name</label>
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
                        @click="emit('update:isCreateOpen', false)">
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

    <!-- EDIT STUDENT MODAL -->
    <div v-if="isEditOpen"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-xl">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-2xl font-bold text-gray-800">Edit Student</h2>
                <button @click="emit('update:isEditOpen', false)" class="text-gray-400 hover:text-gray-600">
                    ✕
                </button>
            </div>

            <form class="space-y-5" @submit.prevent="handleUpdate">
                <div>
                    <label class="block mb-2 text-sm font-semibold text-gray-700">Student ID</label>
                    <input v-model="editStudent.student_id"
                        class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        required />
                </div>

                <div>
                    <label class="block mb-2 text-sm font-semibold text-gray-700">Full Name</label>
                    <input v-model="editStudent.fullname"
                        class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                        required />
                </div>

                <div>
                    <label class="block mb-2 text-sm font-semibold text-gray-700">Program / Set</label>
                    <input v-model="editStudent.set"
                        class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors" />
                </div>

                <div>
                    <label class="block mb-2 text-sm font-semibold text-gray-700">Status</label>
                    <select v-model="editStudent.status"
                        class="w-full border-2 border-gray-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors">
                        <option value="enrolled">Enrolled</option>
                        <option value="inactive">Inactive</option>
                        <option value="pending">Pending</option>
                    </select>
                </div>

                <div class="flex justify-end gap-3 pt-4">
                    <button type="button"
                        class="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-200 transition-colors duration-200"
                        @click="emit('update:isEditOpen', false)">
                        Cancel
                    </button>
                    <button type="submit"
                        class="px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-200">
                        Save Changes
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- DELETE CONFIRMATION -->
    <div v-if="isDeleteOpen"
        class="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
        <div class="bg-white p-6 rounded-2xl shadow-xl max-w-md w-full text-center">
            <h2 class="text-xl font-bold mb-4">Delete Student?</h2>
            <p class="text-gray-600 mb-6">
                This action cannot be undone.
            </p>

            <div class="flex justify-center space-x-4">
                <button @click="emit('update:isDeleteOpen', false)"
                    class="px-6 py-3 bg-gray-300 rounded-lg hover:bg-gray-400 transition-colors">
                    Cancel
                </button>

                <button @click="handleDelete"
                    class="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                    Delete
                </button>
            </div>
        </div>
    </div>
</template>