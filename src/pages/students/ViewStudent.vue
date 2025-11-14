<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import {
    ArrowLeft,
    Mail,
    Phone,
    MapPin,
    Calendar,
    BookOpen,
    CreditCard,
    CheckCircle,
    Clock,
    FileText,
    XCircle,
    Eye,
    TriangleAlert,
    Pencil,
} from 'lucide-vue-next';

type StudentStatus = "enrolled" | "inactive" | "pending";

interface Student {
    id: number;
    student_id: string;
    fullname: string;
    set: string;
    status: StudentStatus;
}

interface Props {
    student: Student;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    back: [];
    edit: [student: Student];
    delete: [student: Student];
}>();

const activeTab = ref<'fees' | 'payments' | 'submissions'>('fees');

const fees = ref([
    { id: 1, description: 'Tuition Fee', amount: 25000, status: 'paid' as const, due_date: 'September 1, 2024' },
    { id: 2, description: 'Laboratory Fee', amount: 5000, status: 'paid' as const, due_date: 'September 1, 2024' },
    { id: 3, description: 'Library Fee', amount: 1500, status: 'pending' as const, due_date: 'November 30, 2024' },
    { id: 4, description: 'Miscellaneous Fee', amount: 3000, status: 'overdue' as const, due_date: 'October 15, 2024' },
    { id: 5, description: 'Tuition Fee', amount: 25000, status: 'paid' as const, due_date: 'September 1, 2024' },
    { id: 6, description: 'Laboratory Fee', amount: 5000, status: 'paid' as const, due_date: 'September 1, 2024' },
    { id: 7, description: 'Library Fee', amount: 1500, status: 'pending' as const, due_date: 'November 30, 2024' },
    { id: 8, description: 'Miscellaneous Fee', amount: 3000, status: 'overdue' as const, due_date: 'October 15, 2024' },
    { id: 9, description: 'Tuition Fee', amount: 25000, status: 'paid' as const, due_date: 'September 1, 2024' },
    { id: 10, description: 'Laboratory Fee', amount: 5000, status: 'paid' as const, due_date: 'September 1, 2024' },
    { id: 11, description: 'Library Fee', amount: 1500, status: 'pending' as const, due_date: 'November 30, 2024' },
    { id: 12, description: 'Miscellaneous Fee', amount: 3000, status: 'overdue' as const, due_date: 'October 15, 2024' },
]);

const payments = ref([
    {
        id: 1,
        amount: 15000,
        payment_date: 'August 25, 2024',
        method: 'Bank Transfer',
        reference: 'BT-2024-001234',
        status: 'completed' as const,
        applied_to: 'Tuition Fee (Partial)',
    },
    {
        id: 2,
        amount: 10000,
        payment_date: 'September 15, 2024',
        method: 'Cash',
        reference: 'CASH-2024-000567',
        status: 'completed' as const,
        applied_to: 'Tuition Fee (Balance)',
    },
    {
        id: 3,
        amount: 5000,
        payment_date: 'September 15, 2024',
        method: 'Cash',
        reference: 'CASH-2024-000568',
        status: 'completed' as const,
        applied_to: 'Laboratory Fee',
    },
    {
        id: 4,
        amount: 15000,
        payment_date: 'August 25, 2024',
        method: 'Bank Transfer',
        reference: 'BT-2024-001234',
        status: 'completed' as const,
        applied_to: 'Tuition Fee (Partial)',
    },
    {
        id: 5,
        amount: 10000,
        payment_date: 'September 15, 2024',
        method: 'Cash',
        reference: 'CASH-2024-000567',
        status: 'completed' as const,
        applied_to: 'Tuition Fee (Balance)',
    },
    {
        id: 6,
        amount: 5000,
        payment_date: 'September 15, 2024',
        method: 'Cash',
        reference: 'CASH-2024-000568',
        status: 'completed' as const,
        applied_to: 'Laboratory Fee',
    },
    {
        id: 7,
        amount: 5000,
        payment_date: 'September 15, 2024',
        method: 'Cash',
        reference: 'CASH-2024-000568',
        status: 'completed' as const,
        applied_to: 'Laboratory Fee',
    },
    {
        id: 8,
        amount: 5000,
        payment_date: 'September 15, 2024',
        method: 'Cash',
        reference: 'CASH-2024-000568',
        status: 'completed' as const,
        applied_to: 'Laboratory Fee',
    },
    {
        id: 9,
        amount: 5000,
        payment_date: 'September 15, 2024',
        method: 'Cash',
        reference: 'CASH-2024-000568',
        status: 'completed' as const,
        applied_to: 'Laboratory Fee',
    },
    {
        id: 10,
        amount: 5000,
        payment_date: 'September 15, 2024',
        method: 'Cash',
        reference: 'CASH-2024-000568',
        status: 'completed' as const,
        applied_to: 'Laboratory Fee',
    }, {
        id: 11,
        amount: 5000,
        payment_date: 'September 15, 2024',
        method: 'Cash',
        reference: 'CASH-2024-000568',
        status: 'completed' as const,
        applied_to: 'Laboratory Fee',
    },
]);

const submissions = ref([
    {
        id: 1,
        amount: 3000,
        submission_date: 'November 10, 2024',
        method: 'GCash',
        reference: 'GC-2024-789012',
        status: 'pending' as const,
        proof_url: '#',
        notes: 'Payment for Miscellaneous Fee',
    },
    {
        id: 2,
        amount: 1500,
        submission_date: 'November 12, 2024',
        method: 'Bank Transfer',
        reference: 'BT-2024-345678',
        status: 'verified' as const,
        proof_url: '#',
        notes: 'Library Fee payment',
    },
    {
        id: 3,
        amount: 1600,
        submission_date: 'November 12, 2025',
        method: 'Bank Transfer',
        reference: 'BT-2024-845672',
        status: 'rejected' as const,
        proof_url: '#',
        notes: 'Library Fee payment',
    },
    {
        id: 4,
        amount: 3000,
        submission_date: 'November 10, 2024',
        method: 'GCash',
        reference: 'GC-2024-789012',
        status: 'pending' as const,
        proof_url: '#',
        notes: 'Payment for Miscellaneous Fee',
    },
    {
        id: 5,
        amount: 1500,
        submission_date: 'November 12, 2024',
        method: 'Bank Transfer',
        reference: 'BT-2024-345678',
        status: 'verified' as const,
        proof_url: '#',
        notes: 'Library Fee payment',
    },
    {
        id: 6,
        amount: 1600,
        submission_date: 'November 12, 2025',
        method: 'Bank Transfer',
        reference: 'BT-2024-845672',
        status: 'rejected' as const,
        proof_url: '#',
        notes: 'Library Fee payment',
    },
    {
        id: 7,
        amount: 3000,
        submission_date: 'November 10, 2024',
        method: 'GCash',
        reference: 'GC-2024-789012',
        status: 'pending' as const,
        proof_url: '#',
        notes: 'Payment for Miscellaneous Fee',
    },
    {
        id: 8,
        amount: 1500,
        submission_date: 'November 12, 2024',
        method: 'Bank Transfer',
        reference: 'BT-2024-345678',
        status: 'verified' as const,
        proof_url: '#',
        notes: 'Library Fee payment',
    },
    {
        id: 9,
        amount: 1600,
        submission_date: 'November 12, 2025',
        method: 'Bank Transfer',
        reference: 'BT-2024-845672',
        status: 'rejected' as const,
        proof_url: '#',
        notes: 'Library Fee payment',
    },
    {
        id: 10,
        amount: 3000,
        submission_date: 'November 10, 2024',
        method: 'GCash',
        reference: 'GC-2024-789012',
        status: 'pending' as const,
        proof_url: '#',
        notes: 'Payment for Miscellaneous Fee',
    },
    {
        id: 11,
        amount: 1500,
        submission_date: 'November 12, 2024',
        method: 'Bank Transfer',
        reference: 'BT-2024-345678',
        status: 'verified' as const,
        proof_url: '#',
        notes: 'Library Fee payment',
    },
    {
        id: 12,
        amount: 1600,
        submission_date: 'November 12, 2025',
        method: 'Bank Transfer',
        reference: 'BT-2024-845672',
        status: 'rejected' as const,
        proof_url: '#',
        notes: 'Library Fee payment',
    },
]);

const pendingSubmissions = computed(() => submissions.value.filter(s => s.status === 'pending').length);

function handleApproveSubmission(submissionId: number) {
    const submission = submissions.value.find(s => s.id === submissionId);
    if (submission) {
        submission.status = 'verified';
    }
}

function handleRejectSubmission(submissionId: number) {
    const index = submissions.value.findIndex(s => s.id === submissionId);
    if (index !== -1) {
        submissions.value[index].status = 'rejected';
    }
}

function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(amount);
}

const searchQuery = ref("");
const statusFilter = ref("all");

const itemsPerPage = 5;
const currentPage = ref(1);

function paginate(list: any[]) {
    const start = (currentPage.value - 1) * itemsPerPage;
    return list.slice(start, start + itemsPerPage);
}

const totalPages = computed(() => (listLength: number) =>
    Math.ceil(listLength / itemsPerPage)
);

watch([searchQuery, statusFilter], () => (currentPage.value = 1));


const filteredFees = computed(() => {
    const q = searchQuery.value.toLowerCase();

    return fees.value.filter(f =>
        (
            f.description.toLowerCase().includes(q) ||
            f.amount.toString().includes(q) ||
            f.status.toLowerCase().includes(q) ||
            f.due_date.toLowerCase().includes(q)
        ) &&
        (statusFilter.value === "all" || f.status === statusFilter.value)
    );
});

const paginatedFees = computed(() => paginate(filteredFees.value));

const filteredPayments = computed(() => {
    const q = searchQuery.value.toLowerCase();

    return payments.value.filter(p =>
        (
            p.method.toLowerCase().includes(q) ||
            p.reference.toLowerCase().includes(q) ||
            p.amount.toString().includes(q) ||
            p.payment_date.toLowerCase().includes(q) ||
            p.status.toLowerCase().includes(q) ||
            p.applied_to.toLowerCase().includes(q)
        ) &&
        (statusFilter.value === "all" || p.status === statusFilter.value)
    );
});
      
const paginatedPayments = computed(() => paginate(filteredPayments.value));

const filteredSubmissions = computed(() => {
    const q = searchQuery.value.toLowerCase();

    return submissions.value
        .filter(s =>
            (
                s.method.toLowerCase().includes(q) ||
                s.reference.toLowerCase().includes(q) ||
                s.status.toLowerCase().includes(q) ||
                s.submission_date.toLowerCase().includes(q) ||
                s.notes.toLowerCase().includes(q) ||
                s.amount.toString().includes(q)
            ) &&
            (statusFilter.value === "all" || s.status === statusFilter.value)
        )
        .sort((a, b) => {
            if (a.status === "pending" && b.status !== "pending") return -1;
            if (a.status !== "pending" && b.status === "pending") return 1;
            return 0;
        });
});

const paginatedSubmissions = computed(() => paginate(filteredSubmissions.value));
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <div class="container mx-auto px-4 py-8">
            <!-- Back button -->
            <button @click="emit('back')"
                class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors">
                <ArrowLeft class="h-5 w-5 mr-2" />
                Back to Students
            </button>

            <!-- Student Info Card -->
            <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
                <div class="flex flex-col md:flex-row gap-8">
                    <!-- Student Details -->
                    <div class="flex-grow">
                        <div class="flex items-start justify-between mb-4">
                            <div>
                                <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ student.fullname }}</h1>
                                <p class="text-lg text-gray-600">{{ student.student_id }}</p>
                            </div>

                            <div class="flex gap-2">
                                <span class="px-4 py-2 inline-flex text-sm leading-5 font-bold rounded-full" :class="{
                                    'bg-emerald-100 text-emerald-800': student.status === 'enrolled',
                                    'bg-red-100 text-red-800': student.status === 'inactive',
                                    'bg-amber-100 text-amber-800': student.status === 'pending',
                                }">
                                    {{ student.status.charAt(0).toUpperCase() + student.status.slice(1) }}
                                </span>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-gray-700 mb-4">
                            <div class="flex items-center">
                                <Mail class="h-5 w-5 mr-3 text-gray-400" />
                                <span>{{ student.fullname.toLowerCase().replace(/\s+/g, '.') }}@example.edu</span>
                            </div>
                            <div class="flex items-center">
                                <Phone class="h-5 w-5 mr-3 text-gray-400" />
                                <span>+63 912 345 6789</span>
                            </div>
                            <div class="flex items-center">
                                <MapPin class="h-5 w-5 mr-3 text-gray-400" />
                                <span>Davao City, Philippines</span>
                            </div>
                            <div class="flex items-center">
                                <Calendar class="h-5 w-5 mr-3 text-gray-400" />
                                <span>Enrolled: August 15, 2020</span>
                            </div>
                            <div class="flex items-center">
                                <BookOpen class="h-5 w-5 mr-3 text-gray-400" />
                                <span>{{ student.set }}</span>
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
                            <p class="text-2xl font-bold text-gray-900">₱34,500.00</p>
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
                            <p class="text-2xl font-bold text-emerald-600">₱30,000.00</p>
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
                            <p class="text-2xl font-bold text-red-600">₱4,500.00</p>
                        </div>
                        <div class="bg-red-100 p-3 rounded-full">
                            <Clock class="h-6 w-6 text-red-600" />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Tabs Container -->
            <div class="bg-white rounded-2xl shadow-lg overflow-hidden mb-6">
                <div class="border-b border-gray-200">
                    <nav class="flex -mb-px">
                        <button @click="activeTab = 'fees'" :class="[
                            'px-6 py-4 text-sm font-semibold transition-colors',
                            activeTab === 'fees'
                                ? 'border-b-2 border-blue-600 text-blue-600'
                                : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                        ]">
                            Fees & Collections
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
                        <div v-if="fees.length != 0" class="flex items-center justify-between mb-4">
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
                                            Description</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Amount</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Due Date</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Status</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="fee in paginatedFees" :key="fee.id" class="hover:bg-gray-50">
                                        <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ fee.id }}
                                        </td>
                                        <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ fee.description }}
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-600">{{ formatCurrency(fee.amount) }}
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-600">{{ fee.due_date }}</td>
                                        <td class="px-6 py-4">
                                            <span class="px-3 py-1 text-xs font-bold rounded-full" :class="{
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
                             <div v-if="fees.length === 0" class="text-center py-12">
                                <FileText class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <p class="text-xl font-medium text-gray-700 mb-2">No Fees</p>
                                <p class="text-sm text-gray-500">Fees will appear here when students have transactions.</p>
                            </div>
                            <div v-if="fees.length != 0" class="flex justify-end mt-4 space-x-2">
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
                        <div v-if="payments.length != 0" class="flex items-center justify-between mb-4">
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
                                            Date</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Amount</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Method</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Reference</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Applied To</th>
                                        <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                            Status</th>
                                    </tr>
                                </thead>
                                <tbody class="bg-white divide-y divide-gray-200">
                                    <tr v-for="payment in paginatedPayments" :key="payment.id" class="hover:bg-gray-50">
                                          <td class="px-6 py-4 text-sm text-gray-600">{{ payment.id }}</td>
                                        <td class="px-6 py-4 text-sm text-gray-600">{{ payment.payment_date }}</td>
                                        <td class="px-6 py-4 text-sm font-semibold text-emerald-600">{{
                                            formatCurrency(payment.amount) }}</td>
                                        <td class="px-6 py-4 text-sm text-gray-600">{{ payment.method }}</td>
                                        <td class="px-6 py-4 text-sm text-gray-600 font-mono">{{ payment.reference }}
                                        </td>
                                        <td class="px-6 py-4 text-sm text-gray-600">{{ payment.applied_to }}</td>
                                        <td class="px-6 py-4">
                                            <span
                                                class="px-3 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                                                {{ payment.status.toUpperCase() }}
                                            </span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                               <div v-if="payments.length === 0" class="text-center py-12">
                                <FileText class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <p class="text-xl font-medium text-gray-700 mb-2">No payments</p>
                                <p class="text-sm text-gray-500">Payments will appear here when students have transactions.</p>
                            </div>
                        </div>
                        <div v-if="payments.length != 0" class="flex justify-end mt-4 space-x-2">
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
                        <div v-if="submissions.length != 0" class="flex items-center justify-between mb-4">
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
                        <div class="space-y-4">
                            <div v-for="submission in paginatedSubmissions" :key="submission.id"
                                class="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                                <div class="flex items-start justify-between mb-4">
                                    <div class="flex-grow">
                                           <p class="text-sm text-gray-600 mb-1">ID: {{ submission.id }}</p>
                                        <div class="flex items-center gap-3 mb-2">
                                            <h3 class="text-lg font-semibold text-gray-900">{{
                                                formatCurrency(submission.amount) }}</h3>
                                            <span class="px-3 py-1 text-xs font-bold rounded-full" :class="{
                                                'bg-amber-100 text-amber-800': submission.status === 'pending',
                                                'bg-emerald-100 text-emerald-800': submission.status === 'verified',
                                                'bg-red-100 text-red-800': submission.status === 'rejected',
                                            }">
                                                {{ submission.status.toUpperCase() }}
                                            </span>
                                        </div>
                                        <p class="text-sm text-gray-600 mb-1">{{ submission.method }} - {{
                                            submission.reference }}</p>
                                        <p class="text-sm text-gray-500">Submitted: {{ submission.submission_date }}</p>
                                        <p class="text-sm text-gray-700 mt-2">{{ submission.notes }}</p>
                                    </div>
                                </div>

                                <div class="flex items-center gap-3 mt-4">
                                    <button
                                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                                        <Eye class="h-4 w-4 mr-2" />
                                        View Proof
                                    </button>
                                    <button v-if="submission.status === 'pending'"
                                        @click="handleApproveSubmission(submission.id)"
                                        class="inline-flex items-center px-4 py-2 text-sm font-medium text-emerald-600 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors">
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

                            <div v-if="submissions.length === 0" class="text-center py-12">
                                <FileText class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                <p class="text-xl font-medium text-gray-700 mb-2">No payment submissions</p>
                                <p class="text-sm text-gray-500">Payment submissions will appear here when students
                                    upload proof of payment.</p>
                            </div>
                        </div>

                        <div v-if="submissions.length != 0" class="flex justify-end mt-4 space-x-2">
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