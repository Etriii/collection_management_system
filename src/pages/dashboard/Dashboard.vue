<script setup lang="ts">
// import { ref } from "vue"
import {
  Users,
  CreditCard,
  Clock,
  CheckCircle,
  AlertCircle,
  DollarSign,
  TrendingUp,
  Calendar,
  Smartphone
} from "lucide-vue-next"

// Mock data
const dashboardStats = {
  totalStudents: 1247,
  totalCollected: 145250,
  pendingPayments: 23450,
  gcashPending: 12,
  overduePayments: 8,
  collectionsThisMonth: 87650,
  completionRate: 78
}

const recentTransactions = [
  {
    id: '1',
    studentName: 'Maria Santos',
    amount: 1250,
    type: 'Tuition Fee',
    status: 'completed',
    method: 'GCash',
    time: '2 mins ago'
  },
  {
    id: '2',
    studentName: 'Juan Dela Cruz',
    amount: 850,
    type: 'Locker Rental',
    status: 'completed',
    method: 'Cash',
    time: '5 mins ago'
  },
  {
    id: '3',
    studentName: 'Ana Rodriguez',
    amount: 2150,
    type: 'Laboratory Fee',
    status: 'pending',
    method: 'GCash',
    time: '15 mins ago'
  }
]

const upcomingDeadlines = [
  { type: 'Tuition Fee', deadline: 'Dec 15, 2024', count: 45 },
  { type: 'Laboratory Fee', deadline: 'Dec 20, 2024', count: 23 },
  { type: 'Miscellaneous', deadline: 'Dec 25, 2024', count: 67 }
]
</script>

<template>
  <div class="min-h-screen bg-gray-50/50">

    <main class="container mx-auto px-4 py-2">
      <div class="flex items-center justify-between mb-8">
        <div>
          <p class="text-gray-600 mt-1">Welcome back! Here's what's happening with your collections.</p>
        </div>
        <RouterLink to="/transactions/new" class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg">
          <CreditCard class="mr-2 h-4 w-4" />
          Record Payment
        </RouterLink>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div class="p-4 bg-white rounded-xl shadow">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">Total Students</p>
            <Users class="h-4 w-4 text-gray-400" />
          </div>
          <div class="mt-2 text-2xl font-bold">{{ dashboardStats.totalStudents.toLocaleString() }}</div>
          <p class="text-xs text-gray-500">+12 from last month</p>
        </div>

        <div class="p-4 bg-white rounded-xl shadow">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">Total Collected</p>
            <DollarSign class="h-4 w-4 text-gray-400" />
          </div>
          <div class="mt-2 text-2xl font-bold">₱{{ dashboardStats.totalCollected.toLocaleString() }}</div>
          <p class="text-xs text-gray-500">+15% from last month</p>
        </div>

        <div class="p-4 bg-white rounded-xl shadow">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">Pending Payments</p>
            <Clock class="h-4 w-4 text-gray-400" />
          </div>
          <div class="mt-2 text-2xl font-bold">₱{{ dashboardStats.pendingPayments.toLocaleString() }}</div>
          <p class="text-xs text-gray-500">{{ dashboardStats.overduePayments }} overdue</p>
        </div>

        <div class="p-4 bg-white rounded-xl shadow">
          <div class="flex items-center justify-between">
            <p class="text-sm font-medium">Collection Rate</p>
            <TrendingUp class="h-4 w-4 text-gray-400" />
          </div>
          <div class="mt-2 text-2xl font-bold">{{ dashboardStats.completionRate }}%</div>
          <div class="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div class="bg-blue-600 h-2 rounded-full" :style="{ width: dashboardStats.completionRate + '%' }"></div>
          </div>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

        <div class="bg-white rounded-xl shadow p-4 lg:col-span-2">
          <h2 class="flex items-center text-lg font-semibold mb-2">
            <CreditCard class="mr-2 h-5 w-5" /> Recent Transactions
          </h2>
          <p class="text-sm text-gray-500 mb-4">Latest payment activities</p>

          <div class="space-y-4">
            <div v-for="t in recentTransactions" :key="t.id"
              class="flex items-center justify-between p-4 border rounded-lg">
              <div class="flex items-center space-x-4">
                <div :class="['p-2 rounded-full', t.status === 'completed' ? 'bg-green-100' : 'bg-yellow-100']">
                  <CheckCircle v-if="t.status === 'completed'" class="h-4 w-4 text-green-600" />
                  <Clock v-else class="h-4 w-4 text-yellow-600" />
                </div>
                <div>
                  <p class="font-medium">{{ t.studentName }}</p>
                  <p class="text-sm text-gray-600">{{ t.type }}</p>
                </div>
              </div>
              <div class="text-right">
                <p class="font-semibold">₱{{ t.amount.toLocaleString() }}</p>
                <div class="flex items-center space-x-2 justify-end">
                  <span class="px-2 py-1 text-xs rounded-full"
                    :class="t.method === 'GCash' ? 'bg-blue-100 text-blue-600' : 'bg-gray-200 text-gray-600'">
                    <Smartphone v-if="t.method === 'GCash'" class="inline mr-1 h-3 w-3" />
                    {{ t.method }}
                  </span>
                  <span class="text-xs text-gray-500">{{ t.time }}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="flex justify-between mt-4 border-t pt-4">
            <RouterLink to="/transactions" class="px-4 py-2 border rounded-lg">View All Transactions</RouterLink>
            <RouterLink to="/transactions/new" class="px-4 py-2 bg-blue-600 text-white rounded-lg">Record New Payment
            </RouterLink>
          </div>
        </div>

        <div class="space-y-6">
          <div class="bg-white rounded-xl shadow p-4">
            <h2 class="flex items-center text-lg font-semibold mb-2">
              <Smartphone class="mr-2 h-5 w-5" /> GCash Approvals
            </h2>
            <p class="text-sm text-gray-500 mb-4">Pending payment verifications</p>

            <div class="flex items-center justify-between mb-4">
              <div class="flex items-center space-x-2">
                <AlertCircle class="h-5 w-5 text-orange-500" />
                <span class="text-2xl font-bold">{{ dashboardStats.gcashPending }}</span>
              </div>
              <span class="px-2 py-1 text-xs bg-gray-200 rounded">Pending</span>
            </div>

            <RouterLink to="/gcash-approvals"
              class="w-full block text-center px-4 py-2 bg-blue-600 text-white rounded-lg">
              Review Payments
            </RouterLink>
          </div>

          <div class="bg-white rounded-xl shadow p-4">
            <h2 class="flex items-center text-lg font-semibold mb-4">
              <Calendar class="mr-2 h-5 w-5" /> Upcoming Deadlines
            </h2>
            <div class="space-y-3">
              <div v-for="(d, idx) in upcomingDeadlines" :key="idx" class="flex items-center justify-between">
                <div>
                  <p class="font-medium text-sm">{{ d.type }}</p>
                  <p class="text-xs text-gray-600">{{ d.deadline }}</p>
                </div>
                <span class="px-2 py-1 text-xs border rounded">{{ d.count }} students</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
