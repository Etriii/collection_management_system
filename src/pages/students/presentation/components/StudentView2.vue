<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useStudentsStore } from '@pages/students/presentation/store/useStudentStores';
import {
  ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen,
  CreditCard, CheckCircle, Clock, FileText, XCircle,
  Eye, TriangleAlert, Pencil,
  FileQuestionMark
} from 'lucide-vue-next';

import type { StudentEntity } from '@pages/students/domain/entities/StudentEntities';
import { useRoute } from 'vue-router';
import { storeToRefs } from 'pinia';
// import api from '@services/apiService';

// import { ENDPOINTS } from '@core/url_paths';
// import PayFeesModal from '@components/modals/PayFeesModal.vue';
// import { useAlertStore } from '@store/ui/alert';

import StudentProfile from './StudentProfile.vue';
import StudentSummaryFees from './StudentSummaryFees.vue';

const route = useRoute();
const store = useStudentsStore();

const { selectedStudent, getSelectedStudent: student, } = storeToRefs(store);
const { fetchStudent, fetchStudentSummaryFees, getStudentFinancialCache } = store;

const studentId = Number(route.params.id);

onMounted(async () => {
  if (studentId) {
    fetchStudent(studentId);
    fetchStudentSummaryFees(studentId);
  }
});


const financials = computed(() => getStudentFinancialCache(studentId));


// const emit = defineEmits<{
//     back: [];
//     edit: [student: StudentEntity];
//     delete: [student: StudentEntity];
// }>();



// const activeTab = ref<'fees' | 'payments' | 'submissions'>('fees');

// // Search & filter
// const searchQuery = ref("");
// const statusFilter = ref("all");

// // Pagination
// const itemsPerPage = 5;
// const currentPage = ref(1);

// // Get reactive financials for selected student
// const financials = computed(() => store.getSelectedStudentFinancials() || {
//     fees: [],
//     payments: [],
//     submissions: []
// });

// const totalFeePaid = computed(() => store.totalFeePaid)
// const totalFeeAmount = computed(() => store.totalFeeAmount)
// const totalFeeBalance = computed(() => store.totalFeeBalance)


// // Pending submissions count
// const pendingSubmissions = computed(() =>
//     financials.value.submissions.filter(s => s.status === 'pending').length
// );

// const approvingSubmissionId = ref<number | null>(null);

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

// const totalPages = computed(() => (listLength: number) =>
//     Math.ceil(listLength / itemsPerPage)
// );

// // Reset page when searching or filtering
// watch([searchQuery, statusFilter], () => (currentPage.value = 1));

// const filteredFees = computed(() => {
//     const q = searchQuery.value.toLowerCase();
//     return financials.value.fees.filter(f =>
//         (//f.description.toLowerCase().includes(q) ||
//             f.total_amount.toString().includes(q) ||
//             f.status.toLowerCase().includes(q) ||
//             f.due_date.toLowerCase().includes(q)) &&
//         (statusFilter.value === "all" || f.status === statusFilter.value)
//     );
// });
// const paginatedFees = computed(() => paginate(filteredFees.value));

// const filteredPayments = computed(() => {
//     const q = searchQuery.value.toLowerCase();
//     return financials.value.payments.filter(p =>
//     (p.payment_method.toLowerCase().includes(q) ||
//         // p.toLowerCase().includes(q) ||
//         p.amount_paid.toString().includes(q) ||
//         p.created_at.toLowerCase().includes(q)
//     ));
// });
// const paginatedPayments = computed(() => paginate(filteredPayments.value));

// const filteredSubmissions = computed(() => {
//     const q = searchQuery.value.toLowerCase();
//     return financials.value.submissions
//         .filter(s =>
//             (s.status.toLowerCase().includes(q) ||
//                 s.reference_number.toLowerCase().includes(q) ||
//                 s.status.toLowerCase().includes(q) ||
//                 s.created_at.toLowerCase().includes(q) ||
//                 s.amount_paid.toString().includes(q)) &&
//             (statusFilter.value === "all" || s.status === statusFilter.value)
//         )
//         .sort((a, b) => {
//             if (a.status === "pending" && b.status !== "pending") return -1;
//             if (a.status !== "pending" && b.status === "pending") return 1;
//             return 0;
//         });
// });
// const paginatedSubmissions = computed(() => paginate(filteredSubmissions.value));
// function formatDate(dateString: string) {
//     const date = new Date(dateString)
//     return date.toLocaleString(undefined, {
//         year: 'numeric',
//         month: 'short',
//         day: 'numeric',
//         hour: '2-digit',
//         minute: '2-digit'
//     })
// }

// const PayFeesOpen = ref(false)

// const pendingFees = computed(() => store.pendingFees);

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

</script><template>
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

        <StudentSummaryFees :fees_summary="financials.fees_summary" />
      </div>

    </div>
  </div>
</template>