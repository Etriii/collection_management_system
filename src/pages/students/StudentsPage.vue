<script setup lang="ts">
import { computed, onMounted } from "vue";
import BaseTable, { type TableColumn } from "@components/tables/BaseTable.vue";
import TablePagination from "@components/tables/TablePagination.vue";
import { useStudentsStore } from "@pages/students/presentation/store/useStudentStores";
import { useRouter } from 'vue-router';
import type { StudentEntity } from "./domain/entities/StudentEntities";

import Input from "@components/forms/Input.vue";
import PerPageSelector from "@components/tables/PerPageSelector.vue";

const router = useRouter();
const store = useStudentsStore();

onMounted(store.fetchStudents);

const search = computed({
    get: () => store.students.params.search,
    set: (val: string) => store.setSearch(val),
})

const columns: TableColumn<any>[] = [
    { key: "id", label: "#", align: "center" }, 
    { key: "name", label: "Name", render: (s) => `${s.s_lname}, ${s.s_fname}`, align: "left" },
    { key: "s_studentID", label: "Student ID", align: "right" },
    { key: "program_name", label: "Program", align: "right" },
    { key: "s_lvl", label: "Level", align: "center" },
    { key: "s_status", label: "Status", align: "center" },
];

const rows = computed(() => store.students.data?.data ?? []);
const meta = computed(() => store.students.data);

const goToStudent = (student: StudentEntity) => {
    router.push({
        name: 'student-details',
        params: { id: student.id }
    });
};
</script>

<template>
    <BaseTable :columns="columns" :rows="rows" :loading="store.students.loading" v-on:rowClick="goToStudent">
        <!-- Toolbar -->
        <template #toolbar>
            <div class="flex items-center gap-2">
                <PerPageSelector v-model="store.students.params.perPage" @onChange="store.setPerPage" />

                <div class="px-2 py-1 hover:cursor-pointer bg-green-50 border border-gray-300">Filters</div>
            </div>
            <Input v-model="search" class="w-52" placeholder="Search students..."
                title="Name, Student School Id, Program, Institute" />
        </template>

        <template #cell-s_status="{ row }">
            <span class="px-2 py-1 text-xs rounded" :class="{
                'bg-green-100 text-green-700': row.s_status === 'enrolled',
                'bg-gray-100 text-gray-700': row.s_status !== 'enrolled',
            }">
                {{ row.s_status }}
            </span>
        </template>

        <template #pagination>
            <TablePagination v-if="meta" :current-page="meta.current_page" :per-page="meta.per_page"
                :total-pages="meta.total_pages" :total_items="meta.total_items" @change="store.setPage" />
        </template>
    </BaseTable>
</template>
