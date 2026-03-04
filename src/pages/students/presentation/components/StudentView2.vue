<template>
  <div class="min-h-screen bg-slate-50/50">
    <div class="container mx-auto px-4 py-5 ">
      <div class="mb-6">
        <button @click="$router.push({ name: 'students' })"
          class="group flex items-center gap-2 text-slate-500 hover:text-violet-600 transition-all duration-200 cursor-pointer">
          <div
            class="p-2 rounded-xl bg-white border border-slate-200 shadow-sm group-hover:border-blue-200 group-hover:bg-blue-50 transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" />
            </svg>
          </div>
          <span class="font-bold text-sm tracking-wide uppercase">Back to Students</span>
        </button>
      </div>

      <div class="flex flex-col gap-5">
        <StudentProfile :student="student" :loading="selectedStudent.loading" />
        <StudentSummaryFees v-if="student" :student_id="student.id" />
        <StudentFinancials v-if="student" :student_id="student.id" />
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import {  onMounted } from 'vue';
import { useStudentsStore } from '@pages/students/presentation/store/useStudentStores';


import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import StudentProfile from './StudentProfile.vue';
import StudentSummaryFees from './StudentSummaryFees.vue';
import StudentFinancials from './StudentFinancials.vue';

const route = useRoute();
const students_store = useStudentsStore();

const { selectedStudent, getSelectedStudent: student, } = storeToRefs(students_store);
const { fetchStudent } = students_store;

// const { getF } = storeToRefs(student_financial_store);


const studentId = Number(route.params.id);

onMounted(async () => {
  if (studentId) {
    fetchStudent(studentId);
  }
});

</script>