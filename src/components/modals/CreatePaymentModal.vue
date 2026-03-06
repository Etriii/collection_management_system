<script setup lang="ts">
import { computed, watch, onBeforeUnmount } from "vue"
import {
  XCircle,
  Search,
  Loader2,
  User,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  MinusCircle,
  Info,
} from "lucide-vue-next"

import { useTransactionsStore } from "@stores/transactions_store"

const store = useTransactionsStore()

interface Props {
  isOpen: boolean
  isLoading?: boolean

  getFullStudentName: (s: any) => string
  formatAmount: (v: any) => string
  formatDate: (v: any) => string
  capitalize: (v: any) => string

  availableFeesCount: number
  totalSelectedFeesAmount: number
  totalBalance: number
  remainingBalance: number
  isReadyForPayment: boolean

  closeOnOverlay?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  closeOnOverlay: true,
})

const emit = defineEmits<{
  (e: "close"): void
}>()

function handleClose() {
  emit("close")
}

function onOverlayClick() {
  if (props.closeOnOverlay) handleClose()
}

function onKeydown(e: KeyboardEvent) {
  if (!props.isOpen) return
  if (e.key === "Escape") handleClose()
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) document.body.style.overflow = "hidden"
    else document.body.style.overflow = ""
  },
  { immediate: true }
)

window.addEventListener("keydown", onKeydown)
onBeforeUnmount(() => {
  window.removeEventListener("keydown", onKeydown)
  document.body.style.overflow = ""
})

const studentQuery = computed(() => (store?.newTransaction?.studentSearch || "").trim())

const paymentAmountNumber = computed(() => {
  const raw = store?.newTransaction?.total_amount_paid
  const n = parseFloat(raw || "0")
  return isNaN(n) ? 0 : n
})
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition-opacity duration-200"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition-opacity duration-200"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="isOpen"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
        @click.self="onOverlayClick"
      >
        <!-- Modal -->
        <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
            <h2 class="text-2xl font-bold text-gray-900">Create New Payment</h2>
            <button @click="handleClose" class="text-gray-400 hover:text-gray-600">
              <XCircle class="h-6 w-6" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 space-y-6">
            <div v-if="isLoading" class="text-center">
              <Loader2 class="inline-block animate-spin h-8 w-8 text-blue-600 mb-2" />
              <p class="text-gray-600">Loading...</p>
            </div>

            <form v-else @submit.prevent="store.handleCreateTransaction" class="space-y-6">
              <!-- STEP 1: Select Student -->
              <div class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <h3 class="text-lg font-semibold text-gray-900">1) Select Student</h3>
                  <span class="text-xs text-gray-500">Search by ID, name, or email</span>
                </div>

                <!-- Search Input -->
                <div class="mb-3">
                  <label class="block text-sm font-medium text-gray-700 mb-2">Search Student</label>

                  <div class="flex gap-2">
                    <div class="relative flex-1">
                      <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        v-model="store.newTransaction.studentSearch"
                        @keydown.enter.prevent="store.searchStudentsWithFees(studentQuery)"
                        class="pl-10 w-full border border-gray-300 rounded-lg py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter student ID, name, or email..."
                        autocomplete="off"
                      />
                      <Loader2
                        v-if="store.isLoadingStudents"
                        class="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-400"
                      />
                    </div>

                    <button
                      type="button"
                      @click="store.searchStudentsWithFees(studentQuery)"
                      :disabled="store.isLoadingStudents || studentQuery.length < 2"
                      class="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Search class="h-4 w-4" />
                      Search
                    </button>
                  </div>

                  <p class="mt-1 text-xs text-gray-500">Enter at least 2 characters</p>
                </div>

                <!-- Search Results -->
                <div v-if="!store.selectedStudent && store.newTransaction.studentSearch.length >= 2">
                  <div v-if="store.isLoadingStudents" class="text-center py-6">
                    <Loader2 class="inline-block animate-spin h-8 w-8 text-blue-600 mb-2" />
                    <p class="text-gray-600">Searching students...</p>
                  </div>

                  <div v-else-if="store.students.length > 0" class="space-y-2">
                    <div class="flex items-center justify-between mb-2">
                      <span class="text-sm font-medium text-gray-700">
                        Found {{ store.students.length }} student{{ store.students.length !== 1 ? "s" : "" }}
                      </span>
                      <span class="text-xs text-gray-500">Click to select</span>
                    </div>

                    <div class="space-y-2">
                      <div
                        v-for="student in store.students"
                        :key="student.id"
                        class="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                        @click="store.selectStudent(student)"
                      >
                        <div class="flex items-center gap-3">
                          <User class="h-5 w-5 text-gray-400" />
                          <div class="flex-1 min-w-0">
                            <div class="font-bold text-gray-900">{{ student.s_studentID }}</div>
                            <div class="text-sm text-gray-700 truncate">{{ getFullStudentName(student) }}</div>
                            <div class="text-xs text-gray-500 truncate mt-1">{{ student.s_email }}</div>
                            <div v-if="student.program" class="text-xs text-blue-600 font-medium mt-1">
                              {{ student.program.name }}
                            </div>
                          </div>
                          <ChevronRight class="h-5 w-5 text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div v-else class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <div class="flex items-start gap-2">
                      <AlertCircle class="h-5 w-5 text-yellow-700 mt-0.5" />
                      <div class="text-sm text-yellow-800">
                        <p class="font-medium">No students found</p>
                        <p class="mt-1">Try a different search term.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Selected Student -->
                <div v-if="store.selectedStudent" class="mt-4 bg-emerald-50 border-l-4 border-emerald-500 p-4">
                  <div class="flex items-start justify-between gap-4">
                    <div>
                      <div class="flex items-center gap-2 mb-2">
                        <CheckCircle class="h-5 w-5 text-emerald-600" />
                        <span class="text-sm font-medium text-emerald-800">Selected Student</span>
                      </div>
                      <div class="text-sm font-bold text-gray-900">{{ store.selectedStudent.s_studentID }}</div>
                      <div class="text-sm text-gray-700">{{ getFullStudentName(store.selectedStudent) }}</div>
                      <div class="text-xs text-gray-500 mt-1">{{ store.selectedStudent.s_email }}</div>
                      <div v-if="store.selectedStudent.program" class="text-xs text-blue-600 font-medium mt-1">
                        {{ store.selectedStudent.program.name }}
                      </div>
                    </div>

                    <button
                      type="button"
                      @click="store.clearSelectedStudent"
                      class="px-3 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-white transition-colors text-sm"
                    >
                      Change
                    </button>
                  </div>
                </div>
              </div>

              <!-- STEP 2: Select Fees -->
              <div v-if="store.selectedStudent" class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">2) Select Fees</h3>
                    <p class="text-xs text-gray-500">Click fees to include them in the payment</p>
                  </div>

                  <button
                    v-if="availableFeesCount > 0"
                    type="button"
                    @click="store.addAllFeesToDistribution"
                    class="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
                  >
                    <CheckCircle class="h-4 w-4" />
                    Add All
                  </button>
                </div>

                <div v-if="store.isLoadingFees" class="text-center py-6">
                  <Loader2 class="inline-block animate-spin h-8 w-8 text-blue-600 mb-2" />
                  <p class="text-gray-600">Loading fees...</p>
                </div>

                <div v-else>
                  <div v-if="store.availableFees.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div
                      v-for="fee in store.availableFees"
                      :key="fee.value"
                      @click="store.addFeeToDistribution(fee.value)"
                      class="bg-white border border-gray-200 rounded-lg p-4 hover:border-blue-500 hover:bg-blue-50 cursor-pointer transition-colors"
                    >
                      <div class="flex items-start justify-between gap-3">
                        <div class="min-w-0">
                          <div class="font-medium text-gray-900">
                            {{ fee.category }}
                            <span
                              class="ml-2 px-2 py-0.5 text-xs rounded-full"
                              :class="{
                                'bg-yellow-100 text-yellow-800': fee.status === 'pending',
                                'bg-orange-100 text-orange-800': fee.status === 'partial',
                                'bg-red-100 text-red-800': fee.status === 'overdue',
                                'bg-gray-100 text-gray-800': !fee.status,
                              }"
                            >
                              {{ capitalize(fee.status) || "Unknown" }}
                            </span>
                          </div>

                          <div class="text-xs text-gray-500 mt-1">
                            Amount: ₱{{ formatAmount(fee.amount) }}
                            <span class="ml-2 text-orange-600 font-medium">
                              Balance: ₱{{ formatAmount(fee.balance) }}
                            </span>
                          </div>

                          <div class="text-xs text-gray-400 mt-1">
                            Due: {{ fee.due_date ? formatDate(fee.due_date) : "N/A" }}
                          </div>
                        </div>

                        <PlusCircle class="h-5 w-5 text-blue-600 flex-shrink-0" />
                      </div>
                    </div>
                  </div>

                  <div v-else class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                    <div class="flex items-start gap-2">
                      <Info class="h-5 w-5 text-yellow-700 mt-0.5" />
                      <div class="text-sm text-yellow-800">
                        <p class="font-medium">No pending fees found.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- STEP 3: Payment Details -->
              <div v-if="store.selectedStudent && store.feeDistribution.length > 0" class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">3) Payment Details</h3>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Total Amount (₱)</label>
                    <div class="relative">
                      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                      <input
                        type="number"
                        :value="store.newTransaction.total_amount_paid"
                        @input="(e: any) => (store.newTransaction.total_amount_paid = parseFloat(e.target.value) || 0)"
                        min="0"
                        step="0.01"
                        required
                        class="pl-8 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <p
                      v-if="totalBalance > 0 && (store.newTransaction.total_amount_paid || 0) > totalBalance"
                      class="text-xs text-red-600 mt-1"
                    >
                      Payment amount exceeds total balance. Remaining will be considered as overpayment.
                    </p>
                  </div>

                  <div>
                    <label class="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                    <select
                      v-model="store.newTransaction.payment_method"
                      class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="cash">Cash</option>
                      <option value="gcash">GCash</option>
                      <option value="bank">Bank Transfer</option>
                      <option value="online">Online</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>

              <!-- STEP 4: Fee Distribution -->
              <div v-if="store.selectedStudent && store.feeDistribution.length > 0" class="bg-gray-50 rounded-lg p-4">
                <div class="flex items-center justify-between mb-3">
                  <div>
                    <h3 class="text-lg font-semibold text-gray-900">4) Fee Distribution</h3>
                    <p class="text-xs text-gray-500">Adjust per-fee payment allocation</p>
                  </div>
                </div>

                <div class="bg-blue-50 border-l-4 border-blue-500 p-4">
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p class="text-blue-800 font-medium">Total Fees</p>
                      <p class="text-xl font-bold text-blue-900">₱{{ formatAmount(totalSelectedFeesAmount) }}</p>
                    </div>
                    <div>
                      <p class="text-blue-800 font-medium">Total Balance</p>
                      <p class="text-xl font-bold text-orange-600">₱{{ formatAmount(totalBalance) }}</p>
                    </div>
                    <div>
                      <p class="text-blue-800 font-medium">Payment Amount</p>
                      <p class="text-xl font-bold text-emerald-600">₱{{ formatAmount(paymentAmountNumber) }}</p>
                    </div>
                    <div>
                      <p class="text-blue-800 font-medium">Remaining</p>
                      <p
                        class="text-xl font-bold"
                        :class="Math.abs(remainingBalance) < 0.01 ? 'text-emerald-600' : 'text-blue-900'"
                      >
                        ₱{{ formatAmount(remainingBalance) }}
                      </p>
                    </div>
                  </div>
                </div>

                <div class="mt-4 flex flex-wrap gap-2 justify-end">
                  <button
                    type="button"
                    @click="store.autoDistributeEvenly"
                    :disabled="store.distributionStats.inputAmount <= 0"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Distribute Evenly
                  </button>
                  <button
                    type="button"
                    @click="store.autoDistributeProportionally"
                    :disabled="store.distributionStats.inputAmount <= 0"
                    class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Distribute by Amount
                  </button>
                  <button
                    type="button"
                    @click="store.clearDistribution"
                    class="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                  >
                    Clear All
                  </button>
                </div>

                <div class="mt-4 space-y-3">
                  <div
                    v-for="(fee, index) in store.feeDistribution"
                    :key="fee.fee_id"
                    class="bg-white border border-gray-200 rounded-lg p-4"
                  >
                    <div class="flex items-start justify-between gap-4">
                      <div class="flex-1">
                        <div class="font-semibold text-gray-900 mb-2">
                          {{ fee._category || fee.fee_label?.split("(")[0]?.trim() || "Fee" }}
                        </div>

                        <label class="block text-sm font-medium text-gray-700 mb-1">Amount to Pay</label>

                        <div class="relative">
                          <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">₱</span>
                          <input
                            type="number"
                            :value="fee.distributed_amount"
                            @input="(e: any) => store.updateDistributedAmount(index, parseFloat(e.target.value) || 0)"
                            min="0"
                            step="0.01"
                            class="pl-8 w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
                          />
                        </div>

                        <p class="text-xs text-gray-500 mt-1">
                          Original: ₱{{ formatAmount(fee.original_amount) }} | Balance: ₱{{ formatAmount(fee.balance) }}
                        </p>
                      </div>

                      <button
                        type="button"
                        @click="store.removeFeeFromDistribution(index)"
                        class="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Remove"
                      >
                        <MinusCircle class="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- STEP 5: Payment Summary -->
              <div v-if="store.selectedStudent && store.feeDistribution.length > 0" class="bg-gray-50 rounded-lg p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">5) Payment Summary</h3>

                <div class="bg-white border border-gray-200 rounded-lg p-4">
                  <div class="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p class="text-gray-600">Student:</p>
                      <p class="font-semibold text-lg">{{ getFullStudentName(store.selectedStudent) }}</p>
                    </div>
                    <div>
                      <p class="text-gray-600">Fees Selected:</p>
                      <p class="font-semibold text-lg">{{ store.feeDistribution.length }}</p>
                    </div>
                    <div>
                      <p class="text-gray-600">Amount:</p>
                      <p class="font-semibold text-2xl text-emerald-600">
                        ₱{{ formatAmount(store.newTransaction.total_amount_paid || "0") }}
                      </p>
                    </div>
                    <div>
                      <p class="text-gray-600">Method:</p>
                      <p class="font-semibold uppercase">{{ store.newTransaction.payment_method }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>

          <!-- Footer -->
          <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
            <div class="flex justify-end gap-3">
              <button
                @click="handleClose"
                class="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>

              <button
                @click="store.handleCreateTransaction"
                :disabled="!isReadyForPayment"
                class="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <CheckCircle class="h-4 w-4" />
                Create Payment
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>