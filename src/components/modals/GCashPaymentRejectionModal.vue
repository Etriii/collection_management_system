<script setup lang="ts">
import { ref, computed, watch } from "vue"
import { XCircle, TriangleAlert, Loader2, Eye, Image as ImageIcon } from "lucide-vue-next"
import { useGcashpaymentsStore } from "@stores/gcashpayments_store"
import gcashpayments_api from "@services/api/gcashpayments_api"

const gcashStore = useGcashpaymentsStore()
const isSubmitting = ref(false)

interface FeeItem {
    id: number
    previous_balance: string | number
    amount_paid: string | number
    fee: {
        id: number
        category_id: string
        category_name: string
        total_amount: string | number
        balance: string | number
        status: string
        due_date: string | null
    }
}

interface StudentMini {
    id: number
    full_name: string
    program_name?: string
    s_set?: string
    s_lvl?: number
}

interface PaymentSubmissionDetail {
    id: number
    student?: StudentMini | number
    total_amount_paid?: string | number 
    amount_paid?: string | number
    created_at: string
    updated_at?: string
    reference_number: string
    status: "pending" | "approved" | "rejected"
    screenshot_urls: string[]
    remarks?: string
    reviewed_by?: string | number | null
    reviewed_at?: string | null
    fee_items?: FeeItem[] 
    method?: string
    name?: string 
    feeType?: string 
}

interface Props {
    isOpen: boolean
    payment: PaymentSubmissionDetail | null
    isLoading?: boolean
}

interface Emits {
    (e: "close"): void
    (e: "reject", reason: string): void
}

const props = withDefaults(defineProps<Props>(), { isLoading: false })
const emit = defineEmits<Emits>()

const rejectionReason = ref("")

const studentName = computed(() => {
    const p = props.payment
    if (!p) return "Unknown Student"
    if (p.name) return p.name
    if (typeof p.student === "object" && p.student?.full_name) return p.student.full_name
    return "Unknown Student"
})

const submittedAmount = computed(() => {
    const p = props.payment
    if (!p) return 0
    const raw = (p.total_amount_paid ?? p.amount_paid ?? 0) as any
    const n = typeof raw === "string" ? parseFloat(raw) : Number(raw)
    return isNaN(n) ? 0 : n
})

const feeItems = computed(() => props.payment?.fee_items ?? [])

function handleClose() {
    emit("close")
}

async function handleReject() {
    const reason = rejectionReason.value.trim()
    if (!reason || !props.payment) return

    try {
        isSubmitting.value = true
        await gcashpayments_api.rejectPayment(props.payment.id, { remarks: reason })
        emit("close")
        alert("Payment rejected successfully.")
        await gcashStore.resetAndRefetch()
    } catch (err: any) {
        console.error("Failed to reject payment:", err)
        alert("Failed to reject payment: " + (err.response?.data?.detail || err.message || "Unknown error"))
    } finally {
        isSubmitting.value = false
    }
}

function viewScreenshot(url: string) {
    if (url) window.open(url, "_blank")
}

function formatCurrency(amount: number | string) {
    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return "₱0.00"
    return new Intl.NumberFormat("en-PH", { style: "currency", currency: "PHP" }).format(numAmount)
}

function formatDate(dateString: string) {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return "Invalid Date"
    return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
    })
}

watch(
    () => props.isOpen,
    (isOpen) => {
        if (isOpen) rejectionReason.value = ""
    }
)
</script>

<template>
    <Teleport to="body">
        <Transition enter-active-class="transition-opacity duration-200" enter-from-class="opacity-0"
            enter-to-class="opacity-100" leave-active-class="transition-opacity duration-200"
            leave-from-class="opacity-100" leave-to-class="opacity-0">
            <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div class="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                    <!-- Header -->
                    <div
                        class="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                        <h2 class="text-2xl font-bold text-gray-900">Reject Payment</h2>
                        <button @click="handleClose" class="text-gray-400 hover:text-gray-600 transition-colors">
                            <XCircle class="h-6 w-6" />
                        </button>
                    </div>

                    <!-- Loading -->
                    <div v-if="isLoading" class="p-8 text-center">
                        <Loader2 class="inline-block animate-spin h-8 w-8 text-blue-600 mb-2" />
                        <p class="text-gray-600">Loading payment details...</p>
                    </div>

                    <!-- Body -->
                    <div v-else-if="payment" class="p-6 space-y-6">
                        <!-- Warning -->
                        <div class="bg-red-50 border-l-4 border-red-500 p-4 rounded">
                            <div class="flex items-center">
                                <TriangleAlert class="h-5 w-5 text-red-500 mr-2" />
                                <p class="text-sm text-red-700 font-medium">
                                    You are about to reject this payment. This action cannot be undone.
                                </p>
                            </div>
                        </div>

                        <!-- Payment Info -->
                        <div class="bg-gray-50 rounded-lg p-4">
                            <h3 class="text-lg font-semibold text-gray-900 mb-3">Payment Information</h3>
                            <div class="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p class="text-gray-600">Student:</p>
                                    <p class="font-semibold text-lg">{{ studentName }}</p>
                                </div>

                                <div>
                                    <p class="text-gray-600">Amount:</p>
                                    <p class="font-semibold text-xl text-gray-900">
                                        {{ formatCurrency(submittedAmount) }}
                                    </p>
                                </div>

                                <div>
                                    <p class="text-gray-600">Reference Number:</p>
                                    <p class="font-semibold font-mono">{{ payment.reference_number }}</p>
                                </div>

                                <div>
                                    <p class="text-gray-600">Date Submitted:</p>
                                    <p class="font-semibold">{{ formatDate(payment.created_at) }}</p>
                                </div>

                                <div>
                                    <p class="text-gray-600">Status:</p>
                                    <p class="font-semibold capitalize">{{ payment.status }}</p>
                                </div>

                                <div>
                                    <p class="text-gray-600">Payment Method:</p>
                                    <p class="font-semibold uppercase">{{ payment.method || "GCash" }}</p>
                                </div>
                            </div>
                        </div>

                        <div class="bg-white border border-gray-200 rounded-lg p-4">
                            <h3 class="text-lg font-semibold text-gray-900 mb-3">Fees Included in this Submission</h3>

                            <div v-if="feeItems.length > 0" class="space-y-3">
                                <div v-for="item in feeItems" :key="item.id"
                                    class="flex items-start justify-between gap-4 p-3 rounded-lg bg-gray-50 border border-gray-200">
                                    <div class="min-w-0">
                                        <p class="font-semibold text-gray-900 truncate">
                                            {{ item.fee.category_name }}
                                            <span class="text-gray-500 font-normal">(#{{ item.fee.id }})</span>
                                        </p>
                                        <p class="text-xs text-gray-600">
                                            Previous balance: <span class="font-medium">{{
                                                formatCurrency(item.previous_balance) }}</span>
                                            • Current balance: <span class="font-medium">{{
                                                formatCurrency(item.fee.balance) }}</span>
                                        </p>
                                        <p v-if="item.fee.due_date" class="text-xs text-gray-500">
                                            Due: {{ formatDate(item.fee.due_date) }}
                                        </p>
                                    </div>

                                    <div class="text-right flex-shrink-0">
                                        <p class="text-xs text-gray-600">Applied</p>
                                        <p class="text-sm font-bold text-emerald-700">{{
                                            formatCurrency(item.amount_paid) }}</p>
                                    </div>
                                </div>
                            </div>

                            <div v-else class="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                No fee items found on this submission.
                            </div>
                        </div>

                        <!-- Proof -->
                        <div class="px-4">
                            <h3 class="text-lg font-semibold text-gray-900 mb-3">Proof of Payment</h3>

                            <div v-if="payment.screenshot_urls?.length" class="grid grid-cols-2 gap-3">
                                <div v-for="(url, idx) in payment.screenshot_urls" :key="idx"
                                    class="relative group cursor-pointer" @click="viewScreenshot(url)">
                                    <img :src="url" :alt="`Screenshot ${idx + 1}`"
                                        class="w-full h-48 object-cover rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-colors" />
                                    <div
                                        class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity rounded-lg flex items-center justify-center">
                                        <Eye
                                            class="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    </div>
                                </div>
                            </div>

                            <div v-else class="text-center py-8 bg-gray-50 rounded-lg">
                                <ImageIcon class="h-12 w-12 text-gray-400 mx-auto mb-2" />
                                <p class="text-gray-500">No screenshots available</p>
                            </div>
                        </div>

                        <!-- Reason -->
                        <div>
                            <label for="rejectionReason" class="block text-sm font-medium text-gray-700 mb-2">
                                Rejection Reason <span class="text-red-500">*</span>
                            </label>
                            <textarea id="rejectionReason" v-model="rejectionReason" rows="4" required
                                class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                placeholder="Please provide a clear reason for rejecting this payment..."></textarea>
                            <p class="mt-1 text-xs text-gray-500">This reason will be sent to the student.</p>
                        </div>
                    </div>

                    <!-- Footer -->
                    <div class="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
                        <button @click="handleClose"
                            class="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
                            Cancel
                        </button>

                        <button @click="handleReject" :disabled="isSubmitting || !rejectionReason.trim()"
                            class="px-5 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                            <XCircle class="h-4 w-4" />
                            <span v-if="!isSubmitting">Reject Payment</span>
                            <span v-else>
                                <Loader2 class="h-4 w-4 animate-spin inline mr-1" />
                                Rejecting...
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>