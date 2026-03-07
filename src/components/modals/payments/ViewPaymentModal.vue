<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import BaseModal from '../BaseModal.vue';
import { usePayment } from '@pages/transactions/presentation/composables/usePaymentComposables';
import { formatDateTime } from '@utils/dateFormat';
import ViewPaymentSubmissionModal from '../paymentSubmissions/ViewPaymentSubmissionModal.vue';
import { useViewFee } from '../composables/useModalsComposables';
import ViewFeeModal from '../fees/ViewFeeModal.vue';
const props = defineProps<{
    isOpen: boolean,
    paymentId: number,
}>()

const isModalOpen = defineModel<boolean>("isOpen", { default: false })
const close = () => isModalOpen.value = false

watch(isModalOpen, (newVal) => { if (newVal) fetchPayment(props.paymentId) })

const { payment, loading, fetchPayment } = usePayment()

const initials = computed(() => {
    return payment.value?.fee.student.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2)
})

const viewPaymentSubmission = ref<{ isOpen: boolean, paymentSubmissionId: number }>({ isOpen: false, paymentSubmissionId: 0 })
const clickViewSubmission = (submissionId: number) => {
    viewPaymentSubmission.value.paymentSubmissionId = submissionId
    viewPaymentSubmission.value.isOpen = true
}

const { isFeeModalOpen, feeId, viewFee } = useViewFee()
</script>

<template>
    <ViewPaymentSubmissionModal v-model:is-open="viewPaymentSubmission.isOpen"
        :payment-submission-id="viewPaymentSubmission.paymentSubmissionId" />
    <ViewFeeModal v-model:is-open="isFeeModalOpen" :fee-id="feeId" />

    <BaseModal :isModalOpen="isModalOpen" title="View Payment" size="xxl" :closeOnBackdrop="false" v-on:onClose="close">
        <div class="space-y-6">
            <div v-if="loading"
                class="w-md lg:w-lg mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden font-sans text-lg p-2 animate-pulse">

                <div class="bg-emerald-500/20 rounded-2xl px-8 py-7">

                    <div class="flex items-center justify-between">

                        <div class="space-y-3">
                            <div class="h-3 w-24 bg-white/40 rounded"></div>
                            <div class="h-10 w-40 bg-white/50 rounded"></div>
                        </div>

                        <div class="h-6 w-20 bg-white/40 rounded-full"></div>

                    </div>

                    <div class="my-6 border-t border-white/30"></div>

                    <div class="flex justify-between items-end">
                        <div class="space-y-2">
                            <div class="h-3 w-20 bg-white/40 rounded"></div>
                            <div class="h-4 w-28 bg-white/50 rounded"></div>
                        </div>

                        <div class="space-y-2 text-right">
                            <div class="h-3 w-16 bg-white/40 rounded"></div>
                            <div class="h-4 w-24 bg-white/50 rounded"></div>
                        </div>
                    </div>

                </div>

                <div class="bg-white rounded-2xl shadow-md border border-slate-200 mt-6 overflow-hidden">

                    <div class="px-6 py-5 flex items-center gap-4 border-b border-slate-100">
                        <div class="h-12 w-12 rounded-xl bg-slate-200"></div>
                        <div class="flex-1 space-y-2">
                            <div class="h-4 w-1/2 bg-slate-200 rounded"></div>
                            <div class="h-3 w-1/3 bg-slate-100 rounded"></div>
                        </div>
                    </div>

                    <div class="px-6 py-6 space-y-4">

                        <div class="flex justify-between">
                            <div class="h-3 w-20 bg-slate-200 rounded"></div>
                            <div class="h-3 w-24 bg-slate-200 rounded"></div>
                        </div>

                        <div class="flex justify-between">
                            <div class="h-3 w-28 bg-slate-200 rounded"></div>
                            <div class="h-3 w-20 bg-slate-200 rounded"></div>
                        </div>

                        <div class="flex justify-between">
                            <div class="h-3 w-32 bg-slate-200 rounded"></div>
                            <div class="h-4 w-20 bg-slate-300 rounded"></div>
                        </div>

                        <div class="border-t border-slate-200 pt-4 grid grid-cols-2 gap-4">

                            <div class="space-y-2">
                                <div class="h-2 w-20 bg-slate-100 rounded"></div>
                                <div class="h-3 w-24 bg-slate-200 rounded"></div>
                            </div>

                            <div class="space-y-2">
                                <div class="h-2 w-20 bg-slate-100 rounded"></div>
                                <div class="h-3 w-24 bg-slate-200 rounded"></div>
                            </div>

                            <div class="space-y-2">
                                <div class="h-2 w-24 bg-slate-100 rounded"></div>
                                <div class="h-3 w-32 bg-slate-200 rounded"></div>
                            </div>

                            <div class="space-y-2">
                                <div class="h-2 w-28 bg-slate-100 rounded"></div>
                                <div class="h-3 w-32 bg-slate-200 rounded"></div>
                            </div>

                        </div>

                    </div>
                </div>

                <div class="flex justify-end mt-4 gap-3">
                    <div class="h-9 w-20 bg-slate-200 rounded-lg"></div>
                    <div class="h-9 w-32 bg-slate-300 rounded-lg"></div>
                </div>

            </div>
            <div v-if="!loading && payment"
                class="w-md lg:w-lg mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden font-sans text-lg p-2">
                <div
                    class="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl px-8 py-7 shadow-md text-white">

                    <div class="flex items-center justify-between">

                        <div>
                            <p class="text-[11px] uppercase tracking-wider opacity-80">
                                Amount Paid
                            </p>
                            <h1 class="text-4xl font-semibold tracking-tight mt-1">
                                ₱{{ payment.amount_paid }}
                            </h1>
                        </div>

                        <div>
                            <span
                                class="bg-white/20 backdrop-blur-sm px-4 py-1.5 rounded-full text-xs font-medium tracking-wide">
                                {{ payment.fee.status.toUpperCase() }}
                            </span>
                        </div>

                    </div>

                    <div class="my-6 border-t border-white/20"></div>

                    <div class="flex justify-between items-end text-sm">

                        <div>
                            <p class="text-[10px] uppercase opacity-70 tracking-wider">
                                Transaction ID
                            </p>
                            <p class="font-medium">
                                #{{ payment.id }}
                            </p>
                        </div>

                        <div class="text-right">
                            <p class="text-[10px] uppercase opacity-70 tracking-wider">
                                Date & Time
                            </p>
                            <p class="font-medium">
                                {{ formatDateTime(payment.created_at) }}
                            </p>
                        </div>

                    </div>

                </div>
                <div class="bg-white rounded-2xl shadow-md border border-slate-200 mt-6 overflow-hidden">

                    <div class="px-6 py-5 flex items-center gap-4 border-b border-slate-100">
                        <div
                            class="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center font-bold text-slate-700">
                            {{ initials }}
                        </div>
                        <div>
                            <h3 class="font-semibold text-slate-900">
                                {{ payment.fee.student.full_name }}
                            </h3>
                            <p class="text-xs text-slate-500">
                                {{ payment.fee.student.program_name }} •
                                Level {{ payment.fee.student.s_lvl }} •
                                Set {{ payment.fee.student.s_set }}
                            </p>
                        </div>
                    </div>

                    <div class="px-6 py-6 space-y-4">

                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500">Service</span>
                            <span class="font-medium text-slate-800">
                                {{ payment.fee.category_name }}
                            </span>
                        </div>

                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500">Previous Balance</span>
                            <span class="text-slate-800">
                                ₱{{ payment.previous_balance }}
                            </span>
                        </div>

                        <div class="flex justify-between text-sm">
                            <span class="text-slate-500">Remaining Balance</span>
                            <span class="font-semibold text-rose-600">
                                ₱{{ payment.fee.balance }}
                            </span>
                        </div>

                        <div class="border-t border-slate-200 pt-4 grid grid-cols-2 gap-4 text-xs text-slate-600">

                            <div>
                                <p class="uppercase tracking-wider text-slate-400">Payment Method</p>
                                <p class="font-medium text-slate-800 mt-1 uppercase">
                                    {{ payment.payment_method }}
                                </p>
                            </div>

                            <div>
                                <p class="uppercase tracking-wider text-slate-400">Received By</p>
                                <p class="font-medium text-slate-800 mt-1">
                                    {{ payment.received_by }}
                                </p>
                            </div>

                            <div>
                                <p class="uppercase tracking-wider text-slate-400">Academic Term</p>
                                <p class="font-medium text-slate-800 mt-1">
                                    {{ payment.fee.semester }} Sem, {{ payment.fee.academic_year }}
                                </p>
                            </div>

                            <div>
                                <p class="uppercase tracking-wider text-slate-400">Transaction Date</p>
                                <p class="font-medium text-slate-800 mt-1">
                                    {{ formatDateTime(payment.created_at) }}
                                </p>
                            </div>

                        </div>

                    </div>
                </div>

                <div class="flex justify-end mt-4 gap-3">
                    <button v-on:click="isModalOpen = false"
                        class="px-5 py-2 text-sm rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition cursor-pointer">
                        Close
                    </button>
                    <button v-if="payment.payment_submission"
                        v-on:click="clickViewSubmission(payment.payment_submission)"
                        class="px-5 py-2 text-sm rounded-lg bg-blue-500 text-white hover:bg-blue-600  cursor-pointer">
                        View Gcash Payment
                    </button>
                    <button v-on:click="viewFee(payment.fee.id)"
                        class="px-5 py-2 text-sm rounded-lg bg-ic-primary text-white hover:bg-ic-primary cursor-pointer">
                        View Fee Details
                    </button>
                </div>

            </div>
        </div>
    </BaseModal>
</template>