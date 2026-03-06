<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { XCircle, CheckCircle, Loader2, Eye } from "lucide-vue-next"
import { useGcashpaymentsStore } from "@stores/gcashpayments_store"
import gcashpayments_api from "@services/api/gcashpayments_api"

type Status = "pending" | "approved" | "rejected"

interface FeeInSubmission {
    id: number
    category_id: string
    category_name: string
    total_amount: string
    balance: string
    status: string
    due_date: string | null
}

interface FeeItem {
    id: number
    fee: FeeInSubmission
    previous_balance: string
    amount_paid: string
}

interface PaymentSubmissionDetail {
    id: number
    student: {
        id: number
        full_name: string
        program_name: string
        s_set: string
        s_lvl: number
    }
    screenshot_urls: string[]
    reviewed_by: string | null
    fee_items: FeeItem[]
    created_at: string
    updated_at?: string
    total_amount_paid: string
    reference_number: string
    status: Status
    reviewed_at: string | null
    remarks: string | null
    updated_by: number | null
}

interface FeeAllocation {
    fee_item_id: number
    fee_id: number
    amount: number
}

interface Props {
    isOpen: boolean
    payment: PaymentSubmissionDetail | null
    isLoading?: boolean
}

interface Emits {
    (e: "close"): void
    (e: "approve", allocations: Array<{ fee_id: number; amount: number }>, notes: string): void
}
const gcashStore = useGcashpaymentsStore()
const props = withDefaults(defineProps<Props>(), {
    isLoading: false,
})
const emit = defineEmits<Emits>()
const feeAllocations = ref<FeeAllocation[]>([])
const approvalNotes = ref("")

function toNumber(v: string | number | null | undefined): number {
    const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : 0
    return isNaN(n) ? 0 : n
}

function formatCurrency(amount: number | string) {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount
    const n = isNaN(numAmount) ? 0 : numAmount
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(n)
}

function formatDate(dateString: string) {
    if (!dateString) return "N/A"
    const d = new Date(dateString)
    if (isNaN(d.getTime())) return "Invalid Date"
    return d.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

function viewScreenshot(url: string) {
    if (url) window.open(url, "_blank")
}

function getFeeItemByFeeId(feeId: number) {
    return props.payment?.fee_items?.find((x) => x.fee?.id === feeId)
}

function getFeeBalance(feeId: number): number {
    const item = getFeeItemByFeeId(feeId)
    return item ? toNumber(item.fee.balance) : 0
}

const submittedAmount = computed(() => toNumber(props.payment?.total_amount_paid || 0))

const totalAllocated = computed(() =>
    feeAllocations.value.reduce((sum, a) => sum + (a.amount > 0 ? a.amount : 0), 0)
)

const remainingAmount = computed(() => submittedAmount.value - totalAllocated.value)

const feeItems = computed(() => props.payment?.fee_items ?? [])

const isAllocationValid = computed(() => {
    if (!props.payment) return false
    if (feeItems.value.length === 0) return false

    if (feeAllocations.value.every((a) => a.amount <= 0)) return false

    if (totalAllocated.value - submittedAmount.value > 0.0001) return false

    for (const a of feeAllocations.value) {
        const bal = getFeeBalance(a.fee_id)
        if (a.amount < 0) return false
        if (a.amount - bal > 0.0001) return false
    }

    return true
})


function getMaxAllocationAmount(allocation: FeeAllocation): number {
    const feeBalance = getFeeBalance(allocation.fee_id)
    const availableFromSubmitted = submittedAmount.value - (totalAllocated.value - allocation.amount)
    return Math.max(0, Math.min(feeBalance, availableFromSubmitted))
}


function initFromFeeItems() {
    if (!props.payment) {
        feeAllocations.value = []
        return
    }

    feeAllocations.value = (props.payment.fee_items ?? []).map((item) => ({
        fee_item_id: item.id,
        fee_id: item.fee.id,
        amount: toNumber(item.amount_paid),
    }))

    approvalNotes.value = props.payment.remarks ?? ""
}

function handleClose() {
    emit("close")
}
const isSubmitting = ref(false)

async function handleApprove() {
    if (!props.payment) return alert("No payment selected")
    if (!isAllocationValid.value) return

    try {
        isSubmitting.value = true

        await gcashpayments_api.approvePayment(props.payment.id, {
            remarks: approvalNotes.value || "",
        })

        emit("close")
        alert("Payment approved successfully!")
        await gcashStore.resetAndRefetch()
    } catch (err: any) {
        console.error("Failed to approve payment:", err)
        alert("Failed to approve payment: " + (err.response?.data?.detail || err.message || "Unknown error"))
    } finally {
        isSubmitting.value = false
    }
}

watch(
    feeAllocations,
    (newAllocations) => {
        newAllocations.forEach((a) => {
            const max = getMaxAllocationAmount(a)
            if (a.amount > max) a.amount = Number(max.toFixed(2))
            if (a.amount < 0) a.amount = 0
        })
    },
    { deep: true }
)

watch(
    () => [props.isOpen, props.payment?.id],
    ([open]) => {
        if (open) initFromFeeItems()
    }
)
</script>

<template>
    <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto">
                    <!-- Header -->
                    <div
                        class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <div>
                            <h2 class="text-2xl font-bold text-gray-900">Approve Payment</h2>
                            <p class="text-xs text-gray-500 mt-1">Allocations are based on this payment submission’s fee
                                items.</p>
                        </div>

                        <button @click="handleClose" class="text-gray-400 hover:text-gray-600">
                            <XCircle class="h-6 w-6" />
                        </button>
                    </div>

                    <!-- Body -->
                    <div class="p-6 space-y-6">
                        <div v-if="isLoading" class="text-center">
                            <Loader2 class="inline-block animate-spin h-8 w-8 text-blue-600 mb-2" />
                            <p class="text-gray-600">Loading payment details...</p>
                        </div>

                        <div v-else-if="payment">
                            <!-- Payment Info -->
                            <div class="bg-gray-50 rounded-lg p-4">
                                <h3 class="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>

                                <div class="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                    <div>
                                        <p class="text-gray-600">Student</p>
                                        <p class="font-semibold text-gray-900">{{ payment.student?.full_name || "Unknown Student" }}</p>
                                        <p class="text-xs text-gray-500 mt-1">
                                            {{ payment.student?.program_name || "N/A" }} • {{ payment.student?.s_set ||
                                            "-" }} • Level
                                            {{ payment.student?.s_lvl ?? "-" }}
                                        </p>
                                    </div>

                                    <div>
                                        <p class="text-gray-600">Submitted Amount</p>
                                        <p class="font-semibold text-2xl text-emerald-600">{{
                                            formatCurrency(submittedAmount) }}</p>
                                    </div>

                                    <div>
                                        <p class="text-gray-600">Reference Number</p>
                                        <p class="font-semibold font-mono">{{ payment.reference_number }}</p>
                                    </div>

                                    <div>
                                        <p class="text-gray-600">Date Submitted</p>
                                        <p class="font-semibold">{{ formatDate(payment.created_at) }}</p>
                                    </div>

                                    <div>
                                        <p class="text-gray-600">Status</p>
                                        <p class="font-semibold capitalize">{{ payment.status }}</p>
                                    </div>

                                    <div>
                                        <p class="text-gray-600">Reviewer</p>
                                        <p class="font-semibold">{{ payment.reviewed_by || "—" }}</p>
                                    </div>
                                </div>
                            </div>

                            <!-- Allocation Summary -->
                            <div class="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6">
                                <div class="flex items-center justify-between">
                                    <div>
                                        <p class="text-sm font-medium text-blue-800">Total Allocated</p>
                                        <p class="text-xl font-bold text-blue-900">{{ formatCurrency(totalAllocated) }}
                                        </p>
                                    </div>
                                    <div class="text-right">
                                        <p class="text-sm font-medium text-blue-800">Remaining</p>
                                        <p class="text-xl font-bold"
                                            :class="remainingAmount < 0 ? 'text-red-600' : 'text-blue-900'">
                                            {{ formatCurrency(remainingAmount) }}
                                        </p>
                                    </div>
                                </div>
                            </div>


                            <div v-if="feeItems.length === 0" class="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                                <p class="text-sm text-yellow-800">
                                    This payment submission has no fee items.
                                </p>
                            </div>

                            <!-- Fee Items Table -->
                            <div v-else class="border border-gray-200 rounded-lg overflow-hidden">
                                <div class="grid grid-cols-12 bg-gray-50 text-xs font-semibold text-gray-600 px-4 py-3">
                                    <div class="col-span-5">Fee</div>
                                    <div class="col-span-2 text-right">Prev Bal</div>
                                    <div class="col-span-2 text-right">Current Bal</div>
                                    <div class="col-span-3 text-right">Amount Paid Per Fee</div>
                                </div>

                                <div class="divide-y divide-gray-200">
                                    <div v-for="item in feeItems" :key="item.id"
                                        class="grid grid-cols-12 items-center px-4 py-3 bg-white">
                                        <div class="col-span-5">
                                            <div class="font-semibold text-gray-900">{{ item.fee.category_name }}</div>
                                            <div class="text-xs text-gray-500">
                                                Fee ID: {{ item.fee.id }} • Status: {{ item.fee.status }}
                                                <span v-if="item.fee.due_date"> • Due: {{ formatDate(item.fee.due_date)
                                                    }}</span>
                                            </div>
                                        </div>

                                        <div class="col-span-2 text-right text-sm text-gray-700">
                                            {{ formatCurrency(toNumber(item.previous_balance)) }}
                                        </div>

                                        <div class="col-span-2 text-right text-sm font-semibold text-orange-600">
                                            {{ formatCurrency(toNumber(item.fee.balance)) }}
                                        </div>

                                        <div class="col-span-3">
                                            <div class="flex justify-end">
                                                <input type="number" step="0.01" min="0" readonly
                                                    :value="feeAllocations.find(a => a.fee_id === item.fee.id)?.amount ?? 0"
                                                    class="w-36 text-right border border-gray-200 bg-gray-50 text-gray-500 rounded-lg px-3 py-2 cursor-not-allowed focus:outline-none" />
                                            </div>

                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Notes -->
                            <div>
                                <label class="block text-sm font-medium text-gray-700 mb-2 mt-6">Approval Notes</label>
                                <textarea v-model="approvalNotes" rows="3"
                                    class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                                    placeholder="Add any notes about this approval..." />
                            </div>

                            <!-- Proof -->
                            <div v-if="payment.screenshot_urls?.length" class="mb-6">
                                <h3 class="text-sm font-semibold text-gray-900 mb-3 mt-3">Proof of Payment</h3>
                                <div class="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    <div v-for="(url, idx) in payment.screenshot_urls" :key="idx"
                                        class="relative group cursor-pointer" @click="viewScreenshot(url)">
                                        <img :src="url" :alt="`Screenshot ${idx + 1}`"
                                            class="w-full h-32 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors" />
                                        <div
                                            class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-opacity rounded-lg flex items-center justify-center">
                                            <Eye
                                                class="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
                        <div v-if="payment && !isAllocationValid" class="mb-3">
                            <div v-if="feeAllocations.every(a => a.amount <= 0)"
                                class="text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg p-3">
                                Please enter an amount for at least one fee item.
                            </div>

                            <div v-else-if="totalAllocated > submittedAmount"
                                class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg p-3">
                                Total allocated exceeds submitted amount.
                            </div>

                            <div v-else-if="remainingAmount > 0"
                                class="text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
                                ℹYou still have {{ formatCurrency(remainingAmount) }} unallocated (this is okay).
                            </div>
                        </div>

                        <div class="flex justify-between items-center">
                            <div class="text-sm">
                                <span class="text-gray-600">Submitted: </span>
                                <span class="font-bold text-lg text-gray-900">{{ formatCurrency(submittedAmount)
                                    }}</span>
                                <span class="text-gray-600 ml-4">Allocated: </span>
                                <span class="font-bold text-lg"
                                    :class="totalAllocated > submittedAmount ? 'text-red-600' : 'text-emerald-600'">
                                    {{ formatCurrency(totalAllocated) }}
                                </span>
                            </div>

                            <div class="flex gap-3">
                                <button @click="handleClose"
                                    class="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                                    Cancel
                                </button>

                                <button @click="handleApprove" :disabled="isSubmitting || !isAllocationValid"
                                    class="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                                    <CheckCircle class="h-4 w-4" />
                                    <span v-if="!isSubmitting">
                                        Approve & Process ({{feeAllocations.filter(a => a.amount > 0).length}} fees)
                                    </span>
                                    <span v-else>
                                        <Loader2 class="h-4 w-4 animate-spin inline mr-1" />
                                        Processing...
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>