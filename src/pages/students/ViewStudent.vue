<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useStudentsStore } from '@pages/students/presentation/store/useStudentStores';
import {
    ArrowLeft, Mail, Phone, MapPin, Calendar, BookOpen,
    CreditCard, CheckCircle, Clock, FileText, XCircle,
    Eye, TriangleAlert, Pencil,
    FileQuestionMark
} from 'lucide-vue-next';

import type { StudentEntity } from './domain/entities/StudentEntities';
import api from '@services/apiService';

import { ENDPOINTS } from '@core/url_paths';
import PayFeesModal from '@components/modals/PayFeesModal.vue';

interface Props {
    student: StudentEntity;
}

const props = defineProps<Props>();
const emit = defineEmits<{
    back: [];
    edit: [student: StudentEntity];
    delete: [student: StudentEntity];
}>();

const store = useStudentsStore();

// Tabs
const activeTab = ref<'fees' | 'payments' | 'submissions'>('fees');

// Search & filter
const searchQuery = ref("");
const statusFilter = ref("all");

// Pagination
const itemsPerPage = 5;
const currentPage = ref(1);

// Fetch student's financials when component mounts
onMounted(async () => {
    store.fetchStudent(props.student.id);
    store.fetchStudentFinancials(props.student.id);
});

// Get reactive financials for selected student
const financials = computed(() => store.getSelectedStudentFinancials() || {
    fees: [],
    payments: [],
    submissions: []
});

const totalFeePaid = computed(() => store.totalFeePaid)
const totalFeeAmount = computed(() => store.totalFeeAmount)
const totalFeeBalance = computed(() => store.totalFeeBalance)


// Pending submissions count
const pendingSubmissions = computed(() =>
    financials.value.submissions.filter(s => s.status === 'pending').length
);

const approvingSubmissionId = ref<number | null>(null);

// Approve
async function handleApproveSubmission(submissionId: number) {
    approvingSubmissionId.value = submissionId;

    try {
        await api.patch(`${ENDPOINTS.paymentSubmissions}${submissionId}/`, {
            status: 'approved'
        });

        const submission = financials.value.submissions.find(s => s.id === submissionId);
        if (submission) {
            submission.status = 'approved';
        }
        const studentId = store.selectedStudent?.id ?? props.student.id;
        delete store.studentFinancials[studentId]
        await store.fetchStudentFinancials(studentId)
    } catch (error) {
        console.error('Failed to approve submission:', error);
    } finally {
        approvingSubmissionId.value = null; // reset after done
    }
}


function handleRejectSubmission(submissionId: number) {
    const index = financials.value.submissions.findIndex(s => s.id === submissionId);
    if (index !== -1) financials.value.submissions[index].status = 'rejected';
}

// Currency formatter
function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
}

// Pagination helper
function paginate(list: any[]) {
    const start = (currentPage.value - 1) * itemsPerPage;
    return list.slice(start, start + itemsPerPage);
}

const totalPages = computed(() => (listLength: number) =>
    Math.ceil(listLength / itemsPerPage)
);

// Reset page when searching or filtering
watch([searchQuery, statusFilter], () => (currentPage.value = 1));

const filteredFees = computed(() => {
    const q = searchQuery.value.toLowerCase();
    return financials.value.fees.filter(f =>
        (//f.description.toLowerCase().includes(q) ||
            f.total_amount.toString().includes(q) ||
            f.status.toLowerCase().includes(q) ||
            f.due_date.toLowerCase().includes(q)) &&
        (statusFilter.value === "all" || f.status === statusFilter.value)
    );
});
const paginatedFees = computed(() => paginate(filteredFees.value));

const filteredPayments = computed(() => {
    const q = searchQuery.value.toLowerCase();
    return financials.value.payments.filter(p =>
    (p.payment_method.toLowerCase().includes(q) ||
        // p.toLowerCase().includes(q) ||
        p.amount_paid.toString().includes(q) ||
        p.created_at.toLowerCase().includes(q)
    ));
});
const paginatedPayments = computed(() => paginate(filteredPayments.value));

const filteredSubmissions = computed(() => {
    const q = searchQuery.value.toLowerCase();
    return financials.value.submissions
        .filter(s =>
            (s.status.toLowerCase().includes(q) ||
                s.reference_number.toLowerCase().includes(q) ||
                s.status.toLowerCase().includes(q) ||
                s.created_at.toLowerCase().includes(q) ||
                s.amount_paid.toString().includes(q)) &&
            (statusFilter.value === "all" || s.status === statusFilter.value)
        )
        .sort((a, b) => {
            if (a.status === "pending" && b.status !== "pending") return -1;
            if (a.status !== "pending" && b.status === "pending") return 1;
            return 0;
        });
});
const paginatedSubmissions = computed(() => paginate(filteredSubmissions.value));
function formatDate(dateString: string) {
    const date = new Date(dateString)
    return date.toLocaleString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })
}

const PayFeesOpen = ref(false)

const pendingFees = computed(() => store.pendingFees);

type BulkPaymentPayload = {
    fee_id: number;
    amount_paid: number;
}[];

const submitPayments = async (payload: BulkPaymentPayload) => {
    try {
        const body = {
            payments: payload.map(p => ({
                fee: p.fee_id,
                amount_paid: p.amount_paid.toString(),
            }))
        };

        await api.post(`${ENDPOINTS.payments}bulk/`, body);

        const studentId = store.selectedStudent?.id ?? props.student.id;
        delete store.studentFinancials[studentId];
        await store.fetchStudentFinancials(studentId);
    } catch (error) {
        console.error('Failed add bulk:', error);
    }
}

</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <PayFeesModal v-model:open="PayFeesOpen" :fees="pendingFees" @submit="submitPayments" />
        <div class="container mx-auto px-4 py-8">
            <!-- Back button -->
            <button @click="emit('back')"
                class=" cursor-pointer inline-flex items-center text-blue-600 hover:text-blue-800 mb-6 transition-colors">
                <ArrowLeft class="h-5 w-5 mr-2" />
                Back to Students
            </button>

            <!-- Student Info Card -->
            <div v-if="store.loadingStudent" class=" h-[20vh] w-full flex justify-center items-center">
                <span class=" animate-spin">Loading Pa Ang Profile Sa Student</span>
            </div>
            <div v-else class="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <div class="flex flex-col md:flex-row gap-8">
                    <!-- Student Details -->
                    <div class="flex-grow">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ student.s_fname + " " +
                                    student.s_mname + " " + student.s_lname + " " + student.s_suffix }}</h1>
                                <p class="text-lg text-gray-600">Student ID: {{ student.s_studentID }}</p>
                            </div>

                            <div class="flex gap-2">
                                <span class="px-4 py-2 inline-flex text-sm leading-5 font-bold rounded-full" :class="{
                                    'bg-emerald-100 text-emerald-800': student.s_status === 'enrolled',
                                    'bg-red-100 text-red-800': student.s_status === 'dropped',
                                    'bg-amber-100 text-amber-800': student.s_status === 'graduated',
                                }">
                                    {{ student.s_status.charAt(0).toUpperCase() + student.s_status.slice(1) }}
                                </span>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-4">
                            <div class="flex items-center">
                                <Mail class="h-5 w-5 mr-3 text-gray-400" />
                                <span>{{ student.s_email }}</span>
                            </div>
                            <div class="flex items-center">
                                <FileQuestionMark class="h-5 w-5 mr-3 text-gray-400" />
                                <span>{{ student.program.name + "-" + student.s_lvl + "" + student.s_set }}</span>
                            </div>
                        </div>

                        <div class="flex gap-2 justify-end">
                            <button @click="emit('edit', student)"
                                class="px-4 py-2  text-gray-600 rounded-lg hover:bg-gray-200 hover:text-gray-600 transition-colors flex font-bold">
                                <Pencil class="h-5 w-5 mr-3 text-gray-600" />
                                Edit
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Financial Summary Cards -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div class="bg-white rounded-xl shadow-md p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Total Fees</p>
                            <p class="text-2xl font-bold text-gray-900">

                                {{ formatCurrency(totalFeeAmount) }}</p>
                        </div>
                        <div class="bg-blue-100 p-3 rounded-full">
                            <CreditCard class="h-6 w-6 text-blue-600" />
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-md p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Total Paid</p>
                            <p class="text-2xl font-bold text-emerald-600"> {{ formatCurrency(totalFeePaid) }}</p>
                        </div>
                        <div class="bg-emerald-100 p-3 rounded-full">
                            <CheckCircle class="h-6 w-6 text-emerald-600" />
                        </div>
                    </div>
                </div>

                <div class="bg-white rounded-xl shadow-md p-6">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-sm text-gray-600 mb-1">Balance</p>
                            <p class="text-2xl font-bold text-red-600"> {{ formatCurrency(totalFeeBalance) }}</p>
                        </div>
                        <div class="bg-red-100 p-3 rounded-full">
                            <Clock class="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs Container -->
            <div v-if="store.loadingFinancials" class=" h-[20vh] w-full flex justify-center items-center">
                <span class="  animate-spin">Loading Pa Ang Mga Yes</span>
            </div>
            <div v-else class="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div class="border-b border-gray-200">
                    <nav class="flex -mb-px">
                        <button @click="activeTab = 'fees'" :class="[
                            'px-6 py-4 text-sm font-semibold transition-colors',
                            activeTab === 'fees'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                        ]">
                            Fees
                        </button>
                        <button @click="activeTab = 'payments'" :class="[
                            'px-6 py-4 text-sm font-semibold transition-colors',
                            activeTab === 'payments'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                        ]">
                            Payment History
                        </button>
                        <button @click="activeTab = 'submissions'" :class="[
                            'px-6 py-4 text-sm font-semibold transition-colors relative',
                            activeTab === 'submissions'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                        ]">
                            Payment Submissions
                            <span v-if="pendingSubmissions > 0"
                                class="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-red-500 rounded-full">
                                {{ pendingSubmissions }}
                            </span>
                        </button>
                    </nav>
                </div>

                <!-- Tab Content -->
                <div class="p-6">
                    <!-- Fees Tab -->
                    <div v-if="activeTab === 'fees'">
                        <div v-if="financials.fees.length != 0" class="flex items-center justify-between mb-4">
                            <!-- Search -->
                            <input v-model="searchQuery" type="text" placeholder="Search..."
                                class="px-4 py-2 border border-gray-300 rounded-lg w-1/2" />

                            <div class="  gap-2 flex justify-evenly">
                                <!-- Filter -->
                                <select v-model="statusFilter" class="px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="all">All</option>
                                    <option value="paid">Paid</option>
                                    <option value="pending">Pending</option>
                                    <option value="overdue">Overdue</option>
                                    <option value="verified">Verified</option>
                                    <option value="waived">Rejected</option>
                                </select>
                                <button @click="PayFeesOpen = true"
                                    class=" border border-gray-300 px-3 py-2 rounded-md bg-blue-500 text-white cursor-pointer">
                                    Pay Fees
                                </button>
                            </div>

                        </div>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Total Amount</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Balance</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Category</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Status</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="fee in paginatedFees" :key="fee.id" class="hover:bg-gray-50">
                                        <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ fee.id }}
                                        </td>
                                        <td class="px-6 py-4 text-sm font-medium text-gray-900">{{
                                            formatCurrency(fee.total_amount) }}
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-600">{{ formatCurrency(fee.balance) }}
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-600">{{ fee.category_name }}</td>
                                        <td class="px-6 py-4">
                                            <span class="px-3 py-1 text-xs font-bold rounded-full" :class="{
                                                'bg-emerald-100 text-blue-500': fee.status === 'waived',
                                                'bg-emerald-100 text-emerald-800': fee.status === 'paid',
                                                'bg-amber-100 text-amber-800': fee.status === 'pending',
                                                'bg-red-100 text-red-800': fee.status === 'overdue',
                                            }">
                                                {{ fee.status.toUpperCase() }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div v-if="financials.fees.length === 0" class="text-center py-12">
                                <FileText class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <p class="text-xl font-medium text-gray-700 mb-2">No Fees</p>
                                <p class="text-sm text-gray-500">Fees will appear here when students have transactions.
                                </p>
                            </div>
                            <div v-if="financials.fees.length != 0" class="flex justify-end mt-4 space-x-2">
                                <button @click="currentPage--" :disabled="currentPage === 1"
                                    class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
                                    Previous
                                </button>

                                <button @click="currentPage++"
                                    :disabled="currentPage === totalPages(filteredFees.length)"
                                    class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>


                    <!-- Payments Tab -->
                    <div v-if="activeTab === 'payments'">
                        <div v-if="financials.payments.length != 0" class="flex items-center justify-between mb-4">
                            <!-- Search -->
                            <input v-model="searchQuery" type="text" placeholder="Search..."
                                class="px-4 py-2 border border-gray-300 rounded-lg w-1/2" />

                            <!-- Filter -->
                            <select v-model="statusFilter" class="px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="all">All</option>
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                                <option value="completed">Completed</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div class="overflow-x-auto">
                            <table class="min-w-full divide-y divide-gray-200">
                                <thead class="bg-gray-50">
                                    <tr>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Fee ID</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Amount Paid</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Payment Method</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Submission ID</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="payment in paginatedPayments" :key="payment.id" class="hover:bg-gray-50">
                                        <td class="px-6 py-4 text-sm text-gray-600">{{ payment.id }}</td>
                                        <td class="px-6 py-4 text-sm text-gray-600">{{ payment.fee.id }}</td>
                                        <td class="px-6 py-4 text-sm font-semibold text-emerald-600">{{
                                            formatCurrency(payment.amount_paid) }}</td>
                                        <td class="px-6 py-4 text-sm text-gray-600">{{ payment.payment_method }}</td>
                                        <td class="px-6 py-4 text-sm text-gray-600 font-mono">{{
                                            payment.payment_submission }}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                            <div v-if="financials.payments.length === 0" class="text-center py-12">
                                <FileText class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <p class="text-xl font-medium text-gray-700 mb-2">No payments</p>
                                <p class="text-sm text-gray-500">Payments will appear here when students have
                                    transactions.</p>
                            </div>
                        </div>
                        <div v-if="financials.payments.length != 0" class="flex justify-end mt-4 space-x-2">
                            <button @click="currentPage--" :disabled="currentPage === 1"
                                class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
                                Previous
                            </button>

                            <button @click="currentPage++" :disabled="currentPage === totalPages(filteredFees.length)"
                                class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
                                Next
                            </button>
                        </div>
                    </div>

                    <!-- Submissions Tab -->
                    <div v-if="activeTab === 'submissions'">
                        <div v-if="financials.submissions.length != 0" class="flex items-center justify-between mb-4">
                            <!-- Search -->
                            <input v-model="searchQuery" type="text" placeholder="Search..."
                                class="px-4 py-2 border border-gray-300 rounded-lg w-1/2" />

                            <!-- Filter -->
                            <select v-model="statusFilter" class="px-4 py-2 border border-gray-300 rounded-lg">
                                <option value="all">All</option>
                                <option value="approved">Approved</option>
                                <option value="pending">Pending</option>
                                <option value="overdue">Overdue</option>
                                <option value="completed">Completed</option>
                                <option value="verified">Verified</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>
                        <div class="space-y-4">
                            <div v-for="submission in paginatedSubmissions" :key="submission.id"
                                class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex-grow">
                                        <p class="text-sm text-gray-600 mb-1">ID: {{ submission.id }}</p>
                                        <div class="flex items-center gap-3 mb-2">
                                            <h3 class="text-lg font-semibold text-gray-900">{{
                                                formatCurrency(submission.amount_paid) }}</h3>
                                            <span class="px-3 py-1 text-xs font-bold rounded-full" :class="{
                                                'bg-amber-100 text-amber-800': submission.status === 'pending',
                                                'bg-emerald-100 text-emerald-800': submission.status === 'verified',
                                                'bg-red-100 text-red-800': submission.status === 'rejected',
                                            }">
                                                {{ submission.status.toUpperCase() }}
                                            </span>
                                        </div>
                                        <p class="text-sm text-gray-600 mb-1">GCASH REFERENCE NUMBER - {{
                                            submission.reference_number }}</p>
                                        <p class="text-sm text-gray-500">Submitted: {{ formatDate(submission.created_at)
                                            }}</p>
                                        <p class="text-sm text-gray-700 mt-2">Remarks: {{ submission.remarks ?? "None"
                                            }}
                                        </p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3 mt-4">
                                    <a :href="submission.screenshot_urls[0]" target="blank">
                                        <button
                                            class=" cursor-pointer inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                            <Eye class="h-4 w-4 mr-2" />
                                            View Proof
                                        </button>
                                    </a>
                                    <button v-if="submission.status === 'pending'"
                                        @click="handleApproveSubmission(submission.id)" :class="[
                                            'inline-flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                                            'text-emerald-600 bg-emerald-50 hover:bg-emerald-100',
                                            approvingSubmissionId === submission.id ? 'opacity-50 cursor-not-allowed' : ''
                                        ]">
                                        <CheckCircle class="h-4 w-4 mr-2" />
                                        Approve
                                    </button>
                                    <button v-if="submission.status === 'pending'"
                                        @click="handleRejectSubmission(submission.id)"
                                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors">
                                        <XCircle class="h-4 w-4 mr-2" />
                                        Reject
                                    </button>
                                </div>
                            </div>

                            <div v-if="financials.submissions.length === 0" class="text-center py-12">
                                <FileText class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <p class="text-xl font-medium text-gray-700 mb-2">No payment submissions</p>
                                <p class="text-sm text-gray-500">Payment submissions will appear here when students
                                    upload proof of payment.</p>
                            </div>
                        </div>

                        <div v-if="financials.submissions.length != 0" class="flex justify-end mt-4 space-x-2">
                            <button @click="currentPage--" :disabled="currentPage === 1"
                                class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
                                Previous
                            </button>

                            <button @click="currentPage++" :disabled="currentPage === totalPages(filteredFees.length)"
                                class="px-3 py-1 bg-gray-200 rounded disabled:opacity-50">
                                Next
                            </button>

                        </div>
                    </div>

                </div>

            </div>


            <div class="bg-white rounded-xl shadow-md p-6">
                <div class="flex items-center justify-between">
                    <div>
                        <p class="text-sm text-gray-600 mb-3">Account Settings</p>
                        <div class="flex">
                            <TriangleAlert class="h-7 w-7 mr-2 text-red-600" />
                            <p class="text-2xl font-bold text-red-600">DANGER</p>
                        </div>

                    </div>
                    <button @click="emit('delete', student)"
                        class="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                        Delete
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>