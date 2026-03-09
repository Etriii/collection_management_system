<template>
  <div class="min-h-screen bg-gray-50 p-4 md:p-8">
    <header class="max-w-6xl mx-auto mb-8">
      <h1 class="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
        Payments Dashboard
      </h1>
      <p class="text-sm text-gray-500 mt-1">Manage and review transaction history</p>
    </header>

    <div class="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      <div
        v-for="payment in payments"
        :key="payment.id"
        class="group bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden flex flex-col"
      >
        <div class="p-5 border-b border-gray-50 flex justify-between items-start">
          <div>
            <p class="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Paid</p>
            <h2 class="text-2xl font-bold text-gray-900 leading-none mt-1">
              ${{ payment.total_amount_paid }}
            </h2>
          </div>
          <span 
            :class="statusClass(payment.status)"
            class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border"
          >
            {{ payment.status }}
          </span>
        </div>

        <div class="p-5 space-y-3 flex-grow">
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Reference</span>
            <span class="font-mono font-medium text-gray-700">{{ payment.reference_number }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Payments Made</span>
            <span class="font-medium text-gray-900">{{ payment.fee_payment_count }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Reviewed By</span>
            <span class="font-medium text-gray-900">{{ payment.reviewed_by || 'Pending' }}</span>
          </div>
          <div class="flex justify-between text-sm">
            <span class="text-gray-500">Date</span>
            <span class="font-medium text-gray-900">{{ formatDate(payment.created_at) }}</span>
          </div>

          <div v-if="payment.showScreenshot" class="mt-4 pt-4 border-t border-gray-100 animate-fade-in">
            <div class="grid grid-cols-1 gap-2">
              <img
                v-for="(url, index) in payment.screenshot_urls"
                :key="index"
                :src="url"
                alt="Payment Receipt"
                class="rounded-lg w-full object-cover border border-gray-200"
              />
            </div>
          </div>
        </div>

        <div class="px-5 py-4 bg-gray-50/50 mt-auto">
          <button
            @click="toggleScreenshot(payment.id)"
            class="w-full py-2 px-4 rounded-xl text-sm font-semibold transition-colors duration-200 
                   bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 active:scale-[0.98]"
          >
            View Details
        </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-4px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>

<script lang="ts" setup>
import { reactive } from 'vue';

interface Student {
  id: number;
  full_name: string;
  program_name: string;
  s_set: string;
  s_lvl: number;
}

interface Payment {
  id: number;
  student: Student;
  screenshot_urls: string[];
  reviewed_by: string;
  total_amount_paid: string;
  reference_number: string;
  status: string;
  fee_payment_count: number;
  created_at: string;
  showScreenshot?: boolean;
}

const payments = reactive<Payment[]>([
  {
    id: 27,
    student: {
      id: 1,
      full_name: 'Alex Arnaiz Aparece Jr.',
      program_name: 'BSIT',
      s_set: 'B',
      s_lvl: 3
    },
    screenshot_urls: [
      'http://res.cloudinary.com/dugse4umh/image/upload/v1/payment_submissions/bfgfvfyliafjmk7gnlxg'
    ],
    reviewed_by: 'Etriii',
    total_amount_paid: '40.00',
    reference_number: '696969',
    status: 'approved',
    fee_payment_count: 2,
    created_at: '2026-02-28T07:03:42.207210Z',
    showScreenshot: false
  },
  // You can add more payment objects here
]);

const toggleScreenshot = (id: number) => {
  const payment = payments.find(p => p.id === id);
  if (payment) payment.showScreenshot = !payment.showScreenshot;
};

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const statusClass = (status: string) => {
  switch (status) {
    case 'approved':
      return 'text-green-600 font-bold';
    case 'pending':
      return 'text-yellow-600 font-bold';
    case 'rejected':
      return 'text-red-600 font-bold';
    default:
      return '';
  }
};
</script>
