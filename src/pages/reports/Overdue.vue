<template>
  <div class="min-h-screen bg-gray-50 p-6">
    <!-- Page Title -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">Overdue Payments Analysis</h1>
      <p class="text-gray-500">Breakdown of overdue payments by fee type</p>
    </div>
    
    <!-- Overdue Cards -->
    <div class="space-y-4">
      <!-- Tuition Fee Card -->
      <div class="bg-pink-50 rounded-xl p-6 shadow-sm border border-pink-100">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-800 mb-2">Tuition Fee</h3>
            <p class="text-sm text-gray-600">23 students • Avg 12 days overdue</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <div class="text-xl font-bold text-red-600">₱57,500</div>
            </div>
            <button class="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors shadow-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Send Reminders
            </button>
          </div>
        </div>
      </div>
      
      <!-- Laboratory Fee Card -->
      <div class="bg-pink-50 rounded-xl p-6 shadow-sm border border-pink-100">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-800 mb-2">Laboratory Fee</h3>
            <p class="text-sm text-gray-600">18 students • Avg 8 days overdue</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <div class="text-xl font-bold text-red-600">₱21,600</div>
            </div>
            <button class="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors shadow-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Send Reminders
            </button>
          </div>
        </div>
      </div>
      
      <!-- Miscellaneous Card -->
      <div class="bg-pink-50 rounded-xl p-6 shadow-sm border border-pink-100">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-800 mb-2">Miscellaneous</h3>
            <p class="text-sm text-gray-600">31 students • Avg 5 days overdue</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <div class="text-xl font-bold text-red-600">₱15,500</div>
            </div>
            <button class="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors shadow-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Send Reminders
            </button>
          </div>
        </div>
      </div>
      
      <!-- Locker Rental Card -->
      <div class="bg-pink-50 rounded-xl p-6 shadow-sm border border-pink-100">
        <div class="flex items-center justify-between">
          <div class="flex-1">
            <h3 class="text-lg font-bold text-gray-800 mb-2">Locker Rental</h3>
            <p class="text-sm text-gray-600">12 students • Avg 15 days overdue</p>
          </div>
          <div class="flex items-center space-x-4">
            <div class="text-right">
              <div class="text-xl font-bold text-red-600">₱6,000</div>
            </div>
            <button class="flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-300 transition-colors shadow-sm">
              <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
              Send Reminders
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Summary Section -->
    <div class="mt-8 bg-white rounded-xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-lg font-semibold text-gray-800 mb-4">Overdue Summary</h3>
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="text-center">
          <div class="text-2xl font-bold text-gray-800">84</div>
          <div class="text-sm text-gray-500">Total Overdue Students</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-red-600">₱100,600</div>
          <div class="text-sm text-gray-500">Total Overdue Amount</div>
        </div>
        <div class="text-center">
          <div class="text-2xl font-bold text-orange-600">10</div>
          <div class="text-sm text-gray-500">Average Days Overdue</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OverdueDashboard',
  data() {
    return {
      overdueData: [
        {
          feeType: 'Tuition Fee',
          students: 23,
          avgDays: 12,
          amount: 57500
        },
        {
          feeType: 'Laboratory Fee',
          students: 18,
          avgDays: 8,
          amount: 21600
        },
        {
          feeType: 'Miscellaneous',
          students: 31,
          avgDays: 5,
          amount: 15500
        },
        {
          feeType: 'Locker Rental',
          students: 12,
          avgDays: 15,
          amount: 6000
        }
      ]
    };
  },
  computed: {
    totalStudents() {
      return this.overdueData.reduce((sum, item) => sum + item.students, 0);
    },
    totalAmount() {
      return this.overdueData.reduce((sum, item) => sum + item.amount, 0);
    },
    averageDays() {
      const totalDays = this.overdueData.reduce((sum, item) => sum + (item.avgDays * item.students), 0);
      return Math.round(totalDays / this.totalStudents);
    }
  },
  methods: {
    sendReminders(feeType) {
      // Handle send reminders action
      console.log(`Sending reminders for ${feeType}`);
      // You can implement the actual reminder sending logic here
    }
  }
};
</script>

<style scoped>
/* Custom styles if needed */
</style>
