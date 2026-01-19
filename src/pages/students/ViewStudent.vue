<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
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
    Loader2
} from 'lucide-vue-next';
import type { StudentStatus } from '@core/constants';

import { gcashpayments_api } from '@/services/api/gcashpayments_api';

interface Student {
    id: number;
    s_studentID: string;
    s_fname: string;
    s_mname: string;
    s_lname: string;
    s_suffix: string;
    s_email: string;
    s_set: string;
    s_lvl: number;
    s_status: StudentStatus;
    program: {
        id: number;
        name: string;
        status: string;
        institute: {
            id: number;
            institute_name: string;
            school_name: string;
            school_short_name: string;
        }
    }
}

interface Fee {
    id: number;
    category: {
        id: number;
        category_name: string;
        collection_fee: string;
        description: string;
    };
    total_amount: string;
    balance: string;
    status: 'paid' | 'partial' | 'pending' | 'overdue';
    due_date: string;
    academic_year: string;
    semester: string;
    remarks: string;
}

interface Payment {
    id: number;
    amount: number;
    payment_date: string;
    method: string;
    reference: string;
    status: 'completed' | 'pending' | 'verified' | 'rejected';
    applied_to: string;
}

interface PaymentSubmission {
    id: number;
    amount: number;
    submission_date: string;
    method: string;
    reference: string;
    status: 'pending' | 'verified' | 'rejected';
    proof_url: string;
    notes: string;
}

interface FeesSummary {
    student_id: number;
    total_amount: number;
    total_balance: number;
}

const router = useRouter();
const route = useRoute();

const studentId = computed(() => {
    const id = route.params.id;
    return typeof id === 'string' ? parseInt(id) : (Array.isArray(id) ? parseInt(id[0]) : id);
});

// State
const student = ref<Student | null>(null);
const allFees = ref<Fee[]>([]);
const allPayments = ref<Payment[]>([]);
const allSubmissions = ref<PaymentSubmission[]>([]);
const feesSummary = ref<FeesSummary | null>(null);
const isLoading = ref(false);
const error = ref<string | null>(null);

const activeTab = ref<'fees' | 'payments' | 'submissions'>('payments'); 

const searchQuery = ref("");
const statusFilter = ref("all");

const fullName = computed(() => {
    if (!student.value) return '';
    
    const parts = [
        student.value.s_fname || '',
        student.value.s_mname || '',
        student.value.s_lname || '',
        (student.value.s_suffix && student.value.s_suffix.trim()) || ''
    ].filter(part => part.length > 0);
    
    return parts.join(' ').trim() || 'Unknown Student';
});

const programName = computed(() => {
    return student.value?.program?.name || 'No Program Assigned';
});

const totalFees = computed(() => {
    return feesSummary.value?.total_amount || 0;
});

const totalBalance = computed(() => {
    return feesSummary.value?.total_balance || 0;
});

const totalPaid = computed(() => {
    return totalFees.value - totalBalance.value;
});

const pendingSubmissions = computed(() => {
    return allSubmissions.value.filter(s => s.status === 'pending').length;
});

const latestFees = computed(() => {
    return [...allFees.value]
        .sort((a, b) => new Date(b.due_date).getTime() - new Date(a.due_date).getTime())
        .slice(0, 10);
});

const latestPayments = computed(() => {
    return [...allPayments.value]
        .sort((a, b) => new Date(b.payment_date).getTime() - new Date(a.payment_date).getTime())
        .slice(0, 10);
});

const latestSubmissions = computed(() => {
    return [...allSubmissions.value]
        .sort((a, b) => {
            if (a.status === "pending" && b.status !== "pending") return -1;
            if (a.status !== "pending" && b.status === "pending") return 1;
            
            return new Date(b.submission_date).getTime() - new Date(a.submission_date).getTime();
        })
        .slice(0, 10); 
});

const filteredFees = computed(() => {
    const q = searchQuery.value.toLowerCase();

    return latestFees.value.filter(f =>
        (
            f.category.category_name.toLowerCase().includes(q) ||
            f.total_amount.toLowerCase().includes(q) ||
            f.status.toLowerCase().includes(q) ||
            f.due_date.toLowerCase().includes(q) ||
            f.academic_year.toLowerCase().includes(q) ||
            f.semester.toLowerCase().includes(q)
        ) &&
        (statusFilter.value === "all" || f.status === statusFilter.value)
    );
});

const filteredPayments = computed(() => {
    const q = searchQuery.value.toLowerCase();

    return latestPayments.value.filter(p =>
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

const filteredSubmissions = computed(() => {
    const q = searchQuery.value.toLowerCase();

    return latestSubmissions.value.filter(s =>
        (
            s.method.toLowerCase().includes(q) ||
            s.reference.toLowerCase().includes(q) ||
            s.status.toLowerCase().includes(q) ||
            s.submission_date.toLowerCase().includes(q) ||
            s.notes.toLowerCase().includes(q) ||
            s.amount.toString().includes(q)
        ) &&
        (statusFilter.value === "all" || s.status === statusFilter.value)
    );
});

onMounted(async () => {
    if (studentId.value && !isNaN(studentId.value)) {
        await fetchStudentData();
    } else {
        error.value = 'Invalid student ID';
    }
});

async function fetchStudentData() {
    isLoading.value = true;
    error.value = null;
    
    try {
        console.log('Fetching data for student:', studentId.value);
        
        const [profile, submissionsResponse, paymentsResponse] = await Promise.all([
            gcashpayments_api.getStudentProfile(studentId.value),
            gcashpayments_api.getStudentPaymentSubmissions(studentId.value, { 
                ordering: '-created_at',
                per_page: 100 
            }),
            gcashpayments_api.getStudentPaymentHistory(studentId.value, { 
                ordering: '-created_at',
                per_page: 100 
            })
        ]);
        
        console.log('Student profile:', profile);
        console.log('Payment submissions:', submissionsResponse);
        console.log('Payment history:', paymentsResponse);
        
        student.value = profile.student;
        allFees.value = Array.isArray(profile.fees) ? profile.fees : [];
        feesSummary.value = profile.summary;
        
        allSubmissions.value = submissionsResponse.results.map(sub => ({
            id: sub.id,
            amount: parseFloat(sub.amount_paid),
            submission_date: sub.created_at,
            method: 'GCash',
            reference: sub.reference_number,
            status: sub.status as 'pending' | 'verified' | 'rejected',
            proof_url: sub.screenshot_urls[0] || '',
            notes: sub.remarks || 'No remarks'
        }));
        
        allPayments.value = paymentsResponse.results.map(payment => ({
            id: payment.id,
            amount: parseFloat(payment.amount_paid),
            payment_date: payment.created_at,
            method: payment.payment_method,
            reference: payment.payment_submission ? `PS-${payment.payment_submission}` : `PAY-${payment.id}`,
            status: 'completed' as const,
            applied_to: payment.fee.category_name
        }));
        
        console.log('Total fees loaded:', allFees.value.length);
        console.log('Total payments loaded:', allPayments.value.length);
        console.log('Total submissions loaded:', allSubmissions.value.length);
        
    } catch (err: any) {
        console.error('Error fetching student data:', err);
        error.value = err.message || 'Failed to load student data';
        
        if (err.response?.data?.message) {
            error.value = err.response.data.message;
        }
    } finally {
        isLoading.value = false;
    }
}


function formatCurrency(amount: number | string) {
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-PH', {
        style: 'currency',
        currency: 'PHP',
    }).format(numAmount);
}

function formatDate(dateString: string) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getStatusClass(status: string) {
    switch (status) {
        case 'paid':
        case 'completed':
        case 'verified':
            return 'bg-emerald-100 text-emerald-800';
        case 'pending':
        case 'partial':
            return 'bg-amber-100 text-amber-800';
        case 'overdue':
        case 'rejected':
            return 'bg-red-100 text-red-800';
        default:
            return 'bg-gray-100 text-gray-800';
    }
}

function getStatusText(status: string) {
    return status.toUpperCase();
}

watch(activeTab, () => {
    searchQuery.value = "";
    statusFilter.value = "all";
});

function handleBack() {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push('/');
  }
}


function handleApproveSubmission(submissionId: number) {
    const submission = allSubmissions.value.find(s => s.id === submissionId);
    if (submission) {
        submission.status = 'verified';
    }
}

function handleRejectSubmission(submissionId: number) {
    const index = allSubmissions.value.findIndex(s => s.id === submissionId);
    if (index !== -1) {
        allSubmissions.value[index].status = 'rejected';
    }
}

const viewScreenshot = (payment: any) => {
  if (payment.screenshot_urls && payment.screenshot_urls.length > 0) {
    window.open(payment.screenshot_urls[0], '_blank')
  } else if (payment.screenshot) {
    window.open(payment.screenshot, '_blank')
  }
}
</script>

<template>
    <div class="min-h-screen bg-gray-50">
        <div class="container mx-auto px-4 py-8">
            <!-- Loading State -->
            <div v-if="isLoading" class="text-center py-12">
                <Loader2 class="inline-block animate-spin rounded-full h-8 w-8 text-blue-600" />
                <p class="text-gray-600">Loading student data...</p>
            </div>

            <!-- Error State -->
            <div v-else-if="error" class="text-center py-12">
                <TriangleAlert class="h-12 w-12 text-red-600 mx-auto mb-4" />
                <p class="text-red-600 mb-2">{{ error }}</p>
                <button @click="fetchStudentData" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Try Again
                </button>
            </div>

            <!-- Student Data -->
            <div v-else-if="student" :key="student.id">
                <!-- Back button -->
                <button @click="handleBack"
                    class="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors">
                    <ArrowLeft class="h-5 w-5 mr-2" />
                    Back
                </button>

                <!-- Student Info Card -->
                <div class="bg-white rounded-2xl shadow-lg p-8 mb-6">
                    <div class="flex flex-col md:flex-row gap-8">
                        <!-- Student Details -->
                        <div class="flex-grow">
                            <div class="flex items-start justify-between mb-4">
                                <div>
                                    <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ fullName }}</h1>
                                    <p class="text-lg text-gray-600">{{ student.s_studentID }}</p>
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
                                    <span>{{ student.s_email || 'No email provided' }}</span>
                                </div>
                                <div class="flex items-center">
                                    <Phone class="h-5 w-5 mr-3 text-gray-400" />
                                    <span>Contact info not available</span>
                                </div>
                                <div class="flex items-center">
                                    <BookOpen class="h-5 w-5 mr-3 text-gray-400" />
                                    <span>{{ programName }}</span>
                                </div>
                                <div class="flex items-center">
                                    <Calendar class="h-5 w-5 mr-3 text-gray-400" />
                                    <span>Level {{ student.s_lvl }} - Set {{ student.s_set }}</span>
                                </div>
                                <div class="flex items-center">
                                    <MapPin class="h-5 w-5 mr-3 text-gray-400" />
                                    <span>{{ student.program?.institute?.school_name || 'No school info' }}</span>
                                </div>
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
                                <p class="text-2xl font-bold text-gray-900">{{ formatCurrency(totalFees) }}</p>
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
                                <p class="text-2xl font-bold text-emerald-600">{{ formatCurrency(totalPaid) }}</p>
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
                                <p class="text-2xl font-bold text-red-600">{{ formatCurrency(totalBalance) }}</p>
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
                                <span v-if="allFees.length > 10" class="ml-2 text-xs text-gray-500">
                                    (Showing 10 latest of {{ allFees.length }})
                                </span>
                            </button>
                            <button @click="activeTab = 'payments'" :class="[
                                'px-6 py-4 text-sm font-semibold transition-colors',
                                activeTab === 'payments'
                                    ? 'border-b-2 border-blue-600 text-blue-600'
                                    : 'text-gray-600 hover:text-gray-900 hover:border-gray-300'
                            ]">
                                Payment History
                                <span v-if="allPayments.length > 10" class="ml-2 text-xs text-gray-500">
                                    (Showing 10 latest of {{ allPayments.length }})
                                </span>
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
                                <span v-if="allSubmissions.length > 10" class="ml-2 text-xs text-gray-500">
                                    (Showing 10 latest of {{ allSubmissions.length }})
                                </span>
                            </button>
                        </nav>
                    </div>

                    <!-- Tab Content -->
                    <div class="p-6">
                        <!-- Fees Tab -->
                        <div v-if="activeTab === 'fees'">
                            <div v-if="allFees.length > 0" class="flex items-center justify-between mb-4">
                                <!-- Search -->
                                <input v-model="searchQuery" type="text" placeholder="Search fees..."
                                    class="px-4 py-2 border border-gray-300 rounded-lg w-1/2" />

                                <!-- Filter -->
                                <select v-model="statusFilter" class="px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="all">All</option>
                                    <option value="paid">Paid</option>
                                    <option value="partial">Partial</option>
                                    <option value="pending">Pending</option>
                                    <option value="overdue">Overdue</option>
                                </select>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                ID
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Category
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Amount
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Balance
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Due Date
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Academic Year
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Semester
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        <tr v-for="fee in filteredFees" :key="fee.id" class="hover:bg-gray-50">
                                            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ fee.id }}
                                            </td>
                                            <td class="px-6 py-4 text-sm text-gray-600">
                                                <div class="font-medium">{{ fee.category.category_name }}</div>
                                                <div class="text-xs text-gray-500">{{ fee.category.description }}</div>
                                            </td>
                                            <td class="px-6 py-4 text-sm text-gray-600">{{ formatCurrency(fee.total_amount) }}
                                            </td>
                                            <td class="px-6 py-4 text-sm text-gray-600">{{ formatCurrency(fee.balance) }}
                                            </td>
                                            <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(fee.due_date) }}</td>
                                            <td class="px-6 py-4 text-sm text-gray-600">{{ fee.academic_year }}</td>
                                            <td class="px-6 py-4 text-sm text-gray-600">{{ fee.semester }}</td>
                                            <td class="px-6 py-4">
                                                <span class="px-3 py-1 text-xs font-bold rounded-full" :class="getStatusClass(fee.status)">
                                                    {{ getStatusText(fee.status) }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div v-if="filteredFees.length === 0" class="text-center py-12">
                                    <FileText class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                    <p class="text-xl font-medium text-gray-700 mb-2">No Fees Found</p>
                                    <p class="text-sm text-gray-500">This student has no fee records.</p>
                                </div>
                                <div v-if="allFees.length > 10" class="mt-4 text-sm text-gray-500 text-center">
                                    Showing 10 latest fees. Total fees: {{ allFees.length }}
                                </div>
                            </div>
                        </div>

                        <!-- Payments Tab -->
                        <div v-if="activeTab === 'payments'">
                            <div v-if="allPayments.length > 0" class="flex items-center justify-between mb-4">
                                <!-- Search -->
                                <input v-model="searchQuery" type="text" placeholder="Search payments..."
                                    class="px-4 py-2 border border-gray-300 rounded-lg w-1/2" />

                                <!-- Filter -->
                                <select v-model="statusFilter" class="px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="all">All</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                ID
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Date
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Amount
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Method
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Reference
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Applied To
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Status
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        <tr v-for="payment in filteredPayments" :key="payment.id" class="hover:bg-gray-50">
                                            <td class="px-6 py-4 text-sm text-gray-600">{{ payment.id }}</td>
                                            <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(payment.payment_date) }}
                                            </td>
                                            <td class="px-6 py-4 text-sm font-semibold text-emerald-600">{{
                                                formatCurrency(payment.amount) }}</td>
                                            <td class="px-6 py-4 text-sm text-gray-600">{{ payment.method }}</td>
                                            <td class="px-6 py-4 text-sm text-gray-600 font-mono">{{ payment.reference }}
                                            </td>
                                            <td class="px-6 py-4 text-sm text-gray-600">{{ payment.applied_to }}</td>
                                            <td class="px-6 py-4">
                                                <span class="px-3 py-1 text-xs font-bold rounded-full" :class="getStatusClass(payment.status)">
                                                    {{ getStatusText(payment.status) }}
                                                </span>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div v-if="filteredPayments.length === 0" class="text-center py-12">
                                    <FileText class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                    <p class="text-xl font-medium text-gray-700 mb-2">No Payment History</p>
                                    <p class="text-sm text-gray-500">Payment records will appear here when payments are made.</p>
                                </div>
                                <div v-if="allPayments.length > 10" class="mt-4 text-sm text-gray-500 text-center">
                                    Showing 10 latest payments. Total payments: {{ allPayments.length }}
                                </div>
                            </div>
                        </div>

                        <!-- Submissions Tab -->
                        <div v-if="activeTab === 'submissions'">
                            <div v-if="allSubmissions.length > 0" class="flex items-center justify-between mb-4">
                                <!-- Search -->
                                <input v-model="searchQuery" type="text" placeholder="Search submissions..."
                                    class="px-4 py-2 border border-gray-300 rounded-lg w-1/2" />

                                <!-- Filter -->
                                <select v-model="statusFilter" class="px-4 py-2 border border-gray-300 rounded-lg">
                                    <option value="all">All</option>
                                    <option value="pending">Pending</option>
                                    <option value="verified">Verified</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div class="overflow-x-auto">
                                <table class="min-w-full divide-y divide-gray-200">
                                    <thead class="bg-gray-50">
                                        <tr>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                ID
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Date
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Amount
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Reference
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Status
                                            </th>
                                            <th class="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase">
                                                Actions
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody class="bg-white divide-y divide-gray-200">
                                        <tr v-for="submission in filteredSubmissions" :key="submission.id" class="hover:bg-gray-50">
                                            <td class="px-6 py-4 text-sm font-medium text-gray-900">{{ submission.id }}</td>
                                            <td class="px-6 py-4 text-sm text-gray-600">{{ formatDate(submission.submission_date) }}</td>
                                            <td class="px-6 py-4 text-sm font-semibold text-gray-900">{{ formatCurrency(submission.amount) }}</td>
                                            <td class="px-6 py-4 text-sm text-gray-600 font-mono">{{ submission.reference }}</td>
                                            <td class="px-6 py-4">
                                                <span class="px-3 py-1 text-xs font-bold rounded-full" :class="getStatusClass(submission.status)">
                                                    {{ getStatusText(submission.status) }}
                                                </span>
                                            </td>
                                            <td class="px-6 py-4">
                                                <div class="flex items-center gap-2">
                                                    <button @click="viewScreenshot(p)" v-if="submission.proof_url"
                                                        class="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 bg-blue-50 rounded hover:bg-blue-100 transition-colors">
                                                        <Eye class="h-3 w-3 mr-1" />
                                                        View Proof
                                                    </button>
                                                    <button v-if="submission.status === 'pending'"
                                                        @click="handleApproveSubmission(submission.id)"
                                                        class="inline-flex items-center px-3 py-1 text-xs font-medium text-emerald-600 bg-emerald-50 rounded hover:bg-emerald-100 transition-colors">
                                                        <CheckCircle class="h-3 w-3 mr-1" />
                                                        Approve
                                                    </button>
                                                    <button v-if="submission.status === 'pending'"
                                                        @click="handleRejectSubmission(submission.id)"
                                                        class="inline-flex items-center px-3 py-1 text-xs font-medium text-red-600 bg-red-50 rounded hover:bg-red-100 transition-colors">
                                                        <XCircle class="h-3 w-3 mr-1" />
                                                        Reject
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                                <div v-if="filteredSubmissions.length === 0" class="text-center py-12">
                                    <FileText class="mx-auto h-16 w-16 text-gray-300 mb-4" />
                                    <p class="text-xl font-medium text-gray-700 mb-2">No Payment Submissions</p>
                                    <p class="text-sm text-gray-500">Payment submissions will appear here when students
                                        upload proof of payment.</p>
                                </div>
                                <div v-if="allSubmissions.length > 10" class="mt-4 text-sm text-gray-500 text-center">
                                    Showing 10 latest submissions. Total submissions: {{ allSubmissions.length }}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- No Student Found -->
            <div v-else class="text-center py-12">
                <TriangleAlert class="h-12 w-12 text-yellow-600 mx-auto mb-4" />
                <p class="text-gray-700 mb-4">Student not found</p>
                <button @click="handleBack" 
                        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Back
                </button>
            </div>
        </div>
    </div>
</template>