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
        <StudentSummaryFees v-if="student" :fees_summary="fees.fees_summary" />
        <StudentFinancials v-if="student" :student_id="student.id" />
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useStudentsStore } from '@pages/students/presentation/store/useStudentStores';
import { useStudentsFeesStore } from '@pages/students/presentation/store/useStudentFeeslStore';


import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';

import StudentProfile from './StudentProfile.vue';
import StudentSummaryFees from './StudentSummaryFees.vue';
import StudentFinancials from './StudentFinancials.vue';

const route = useRoute();
const students_store = useStudentsStore();
const student_fees_store = useStudentsFeesStore();

const { selectedStudent, getSelectedStudent: student, } = storeToRefs(students_store);
const { fetchStudent } = students_store;

// const { getF } = storeToRefs(student_financial_store);
const { fetchStudentSummaryFees, getStudentFeesCache } = student_fees_store;


const studentId = Number(route.params.id);

onMounted(async () => {
  if (studentId) {
    fetchStudent(studentId);
    await fetchStudentSummaryFees(studentId);
  }
});


const fees = computed(() => getStudentFeesCache(studentId));


// const emit = defineEmits<{
//     back: [];
//     edit: [student: StudentEntity];
//     delete: [student: StudentEntity];
// }>();



// const activeTab = ref<'fees' | 'payments' | 'submissions'>('fees');


// // Approve
// async function handleApproveSubmission(submissionId: number) {
//     approvingSubmissionId.value = submissionId;

//     try {
//         await api.patch(`${ENDPOINTS.paymentSubmissions}${submissionId}/`, {
//             status: 'approved'
//         });

//         const submission = financials.value.submissions.find(s => s.id === submissionId);
//         if (submission) {
//             submission.status = 'approved';
//         }
//         const studentId = store.selectedStudent?.id ?? props.student.id;
//         delete store.studentFinancials[studentId]
//         await store.fetchStudentFinancials(studentId)
//     } catch (error) {
//         console.error('Failed to approve submission:', error);
//     } finally {
//         approvingSubmissionId.value = null; // reset after done
//     }
// }


// function handleRejectSubmission(submissionId: number) {
//     const index = financials.value.submissions.findIndex(s => s.id === submissionId);
//     if (index !== -1) financials.value.submissions[index].status = 'rejected';
// }

// // Currency formatter
// function formatCurrency(amount: number) {
//     return new Intl.NumberFormat('en-PH', {
//         style: 'currency',
//         currency: 'PHP',
//     }).format(amount);
// }

// // Pagination helper
// function paginate(list: any[]) {
//     const start = (currentPage.value - 1) * itemsPerPage;
//     return list.slice(start, start + itemsPerPage);
// }


// type BulkPaymentPayload = {
//     fee_id: number;
//     amount_paid: number;
// }[];

// const submitPayments = async (payload: BulkPaymentPayload) => {
//     const alert = useAlertStore()
//     try {
//         const body = {
//             payments: payload.map(p => ({
//                 fee: p.fee_id,
//                 amount_paid: p.amount_paid.toString(),
//             }))
//         };

//         await api.post(`${ENDPOINTS.payments}bulk/`, body);

//         alert.show('Payments Successfull', 'success');
//         const studentId = store.selectedStudent?.id ?? props.student.id;
//         delete store.studentFinancials[studentId];
//         await store.fetchStudentFinancials(studentId);
//     } catch (error) {
//         alert.show('Failed to create payments', 'error');
//         console.error('Failed add bulk:', error);
//     }
// }
</script>