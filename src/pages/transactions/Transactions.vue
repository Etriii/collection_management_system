<script setup lang="ts">
import { ref, computed } from "vue"
import {
  Plus,
  Search,
  CheckCircle,
  Clock,
  Send,
  XCircle,
  CreditCard
} from "lucide-vue-next"


type TransactionStatus = "sent" | "paid" | "overdue"
type TransactionCategory = "T-Shirt" | "Attendance Fees" | "Locker" | "Others"

interface Transaction {
  id: string
  transactionNumber: string
  studentId: string
  student: string
  category: TransactionCategory
  amount: number
  dueDate: string
  status: TransactionStatus
}

interface NewTransaction {
  transactionNumber: string
  student: string
  studentId: string
  category: TransactionCategory
  amount: number
  dueDate: string
}

// example data
const transactions = ref<Transaction[]>([
  {
    id: "1",
    transactionNumber: "TRN-7632323344",
    studentId: "2023-00624",
    student: "Micah Angela E. Floro",
    category: "Attendance Fees",
    amount: 1200,
    dueDate: "2025-08-31",
    status: "sent"
  }
])

const searchQuery = ref("")
const activeFilter = ref<"all" | TransactionStatus>("all")
const isCreateTransactionDialogOpen = ref(false)

const newTransaction = ref<NewTransaction>({
  transactionNumber: "",
  studentId: "",
  student: "",
  category: "T-Shirt",
  amount: 0,
  dueDate: ""
})

const filteredTransactions = computed(() =>
  transactions.value.filter((transaction) => {
    const q = searchQuery.value.toLowerCase()
    const matchesSearch =
      transaction.transactionNumber.toLowerCase().includes(q) ||
      transaction.studentId.toLowerCase().includes(q) ||
      transaction.student.toLowerCase().includes(q) ||
      transaction.category.toLowerCase().includes(q)
    const matchesFilter =
      activeFilter.value === "all" || transaction.status === activeFilter.value
    return matchesSearch && matchesFilter
  })
)

const transactionStats = computed(() => {
  const sent = transactions.value.filter((i) => i.status === "sent")
  const paid = transactions.value.filter((i) => i.status === "paid")
  const overdue = transactions.value.filter((i) => i.status === "overdue")

  return {
    sentCount: sent.length,
    paidCount: paid.length,
    overdueCount: overdue.length
  }
})

function handleCreateTransaction() {
  if (
    !newTransaction.value.transactionNumber ||
    !newTransaction.value.student ||
    !newTransaction.value.amount ||
    !newTransaction.value.dueDate
  ) {
    return
  }

  const item: Transaction = {
    id: String(transactions.value.length + 1),
    transactionNumber: newTransaction.value.transactionNumber,
    studentId: newTransaction.value.studentId,
    student: newTransaction.value.student,
    category: newTransaction.value.category,
    amount: newTransaction.value.amount,
    dueDate: newTransaction.value.dueDate,
    status: "sent"
  }

  transactions.value.push(item)

  isCreateTransactionDialogOpen.value = false
  newTransaction.value = {
    transactionNumber: "",
    studentId: "",
    student: "",
    category: "T-Shirt",
    amount: 0,
    dueDate: ""
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <div class="container mx-auto px-4 py-8">
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 mb-8">

        <!-- stats grid -->
        <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between h-full">
          <div>
            <div class="text-3xl font-bold">{{ transactionStats.sentCount }}</div>
            <p class="text-sm text-gray-500">Sent Transactions</p>
            <p class="text-xs text-gray-400">Awaiting payment</p>
          </div>
          <Send class="h-8 w-8 text-blue-500" />
        </div>

        <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between h-full">
          <div>
            <div class="text-3xl font-bold text-green-600">{{ transactionStats.paidCount }}</div>
            <p class="text-sm text-gray-500">Paid Transactions</p>
            <p class="text-xs text-gray-400">Completed</p>
          </div>
          <CheckCircle class="h-8 w-8 text-green-500" />
        </div>

        <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between h-full">
          <div>
            <div class="text-3xl font-bold text-red-600">{{ transactionStats.overdueCount }}</div>
            <p class="text-sm text-gray-500">Overdue</p>
            <p class="text-xs text-gray-400">Need attention</p>
          </div>
          <XCircle class="h-8 w-8 text-red-500" />
        </div>
      </div>

      <!-- main -->
      <div class="bg-white rounded-xl shadow p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h2 class="text-3xl font-bold text-gray-900 leading-tight">Transactions</h2>
            <p class="text-sm text-gray-500 mt-1">View and manage all financial transactions</p>
          </div>
          <button
            class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            @click="isCreateTransactionDialogOpen = true">
            <Plus class="mr-2 h-4 w-4" />
            Create Transaction
          </button>
        </div>

        <!-- search w/ filter -->
        <div class="flex flex-col md:flex-row gap-4 mb-6">
          <div class="flex-1 relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input v-model="searchQuery"
              class="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Search by student name, transaction number, or category..." />
          </div>
          <div class="relative">
            <select v-model="activeFilter"
              class="block appearance-none w-full bg-white border border-gray-300 text-gray-700 py-2 px-4 pr-8 rounded-lg leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="all">All Status</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
            </select>
            <div class="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
              <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <!-- table -->
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Transaction Number</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student ID</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Student Name</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Due Date</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">

              <!-- if empty -->
              <tr v-if="filteredTransactions.length === 0">
                <td colspan="7" class="px-6 py-12 text-center text-gray-500">
                  <CreditCard class="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p class="mb-2 text-gray-700">No transactions found</p>
                  <p class="text-sm text-gray-500">Create your first transaction to get started.</p>
                </td>
              </tr>
              <tr v-for="transaction in filteredTransactions" :key="transaction.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{
                  transaction.transactionNumber }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ transaction.studentId }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ transaction.student }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{{ (transaction.category as
                  string).charAt(0).toUpperCase() + (transaction.category as string).slice(1) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">₱{{ transaction.amount.toLocaleString() }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  <div class="flex items-center">
                    <Clock class="mr-1 h-4 w-4 text-gray-400" />
                    {{ new Date(transaction.dueDate).toLocaleDateString() }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full" :class="{
                    'bg-blue-100 text-blue-800': transaction.status === 'sent',
                    'bg-green-100 text-green-800': transaction.status === 'paid',
                    'bg-red-100 text-red-800': transaction.status === 'overdue'
                  }">
                    {{ (transaction.status as string).charAt(0).toUpperCase() + (transaction.status as string).slice(1)
                    }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- create new transaction -->
    <div v-if="isCreateTransactionDialogOpen"
      class="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl shadow-lg p-6 w-full max-w-lg">
        <h2 class="text-2xl font-bold mb-2 text-gray-800">Create New Transaction</h2>
        <p class="text-sm text-gray-600 mb-6">Fill in the details to generate a new transaction record.</p>

        <form class="space-y-4" @submit.prevent="handleCreateTransaction">
          <div>
            <label for="transactionNumber" class="block mb-1 text-sm font-medium text-gray-700">Transaction
              Number</label>
            <input id="transactionNumber" v-model="newTransaction.transactionNumber"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="TRN-2025-001" required />
          </div>

          <div>
            <label for="studentName" class="block mb-1 text-sm font-medium text-gray-700">Student Name</label>
            <input id="studentName" v-model="newTransaction.student"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Juan Dela Cruz" required />
          </div>

          <div>
            <label for="category" class="block mb-1 text-sm font-medium text-gray-700">Category</label>
            <select id="category" v-model="newTransaction.category"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="T-Shirt">T-Shirt</option>
              <option value="Attendance Fees">Attendance Fees</option>
              <option value="Locker">Locker</option>
              <option value="Others">Others</option>
            </select>
          </div>

          <div>
            <label for="amount" class="block mb-1 text-sm font-medium text-gray-700">Amount (₱)</label>
            <input id="amount" v-model.number="newTransaction.amount" type="number" min="1"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required />
          </div>

          <div>
            <label for="dueDate" class="block mb-1 text-sm font-medium text-gray-700">Due Date</label>
            <input id="dueDate" v-model="newTransaction.dueDate" type="date"
              class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required />
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button type="button"
              class="px-5 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-100 transition-colors"
              @click="isCreateTransactionDialogOpen = false">
              Cancel
            </button>
            <button type="submit"
              class="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
              Create Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>