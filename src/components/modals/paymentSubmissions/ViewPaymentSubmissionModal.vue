<script setup lang="ts">
import { computed, watch } from 'vue';
import BaseModal from '../BaseModal.vue'
import { usePaymentSubmission } from '@pages/gcashpayments/presentation/store/composables/usePaymentSubmissionComposables';
import Button from '@components/button/Button.vue';
import { formatDateTime } from '@utils/dateFormat';
import BaseImage from '@components/common/BaseImage.vue';

const props = defineProps<{ isOpen: boolean, paymentSubmissionId: number }>()
const isModalOpen = defineModel<boolean>("isOpen", { default: false })
const close = () => isModalOpen.value = false

const { loading, paymentSubmission, fetchPaymentSubmission } = usePaymentSubmission()

watch(() => props.isOpen, (newVal) => {
    if (newVal) fetchPaymentSubmission(props.paymentSubmissionId)
})

const initials = computed(() => {
    return paymentSubmission.value?.student.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2);
});

const statusClasses = computed(() => {
    switch (paymentSubmission.value?.status) {
        case 'rejected':
            return 'bg-rose-50/60 border border-rose-200/70 text-rose-800'
        case 'approved':
            return 'bg-emerald-50/60 border border-emerald-200/70 text-emerald-800'
        case 'pending':
            return 'bg-amber-50/60 border border-amber-200/70 text-amber-800'
        default:
            return 'bg-slate-50 border border-slate-200 text-slate-700'
    }
})

const badgeClasses = computed(() => {
    switch (paymentSubmission.value?.status) {
        case 'rejected':
            return 'bg-rose-100/70 text-rose-700'
        case 'approved':
            return 'bg-emerald-100/70 text-emerald-700'
        case 'pending':
            return 'bg-amber-100/70 text-amber-700'
        default:
            return 'bg-slate-100 text-slate-600'
    }
})
</script>

<template>
    <BaseModal :isModalOpen="isModalOpen" title="Payment Submission" size="xl" :closeOnBackdrop="false"
        v-on:onClose="close">

        <div v-if="!loading && paymentSubmission" class="space-y-6">
            <div
                class="w-md lg:w-lg mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden font-sans text-lg">

                <div
                    class="px-8 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-50 via-white to-emerald-50">
                    <div class="flex items-center justify-between">

                        <div>
                            <p class="text-sm font-medium text-slate-400 tracking-widest">
                                Payment Reference
                            </p>
                            <p class="text-lg font-semibold text-slate-900">
                                #{{ paymentSubmission.reference_number }}
                            </p>
                        </div>

                        <span class="px-5 py-1.5 rounded-full text-sm font-medium border" :class="{
                            'bg-yellow-50 text-yellow-700 border-yellow-200': paymentSubmission.status === 'pending',
                            'bg-emerald-50 text-emerald-700 border-emerald-200': paymentSubmission.status === 'approved',
                            'bg-rose-50 text-rose-700 border-rose-200': paymentSubmission.status === 'rejected'
                        }">
                            {{ paymentSubmission.status.charAt(0).toUpperCase() + paymentSubmission.status.slice(1) }}
                        </span>

                    </div>
                </div>


                <div class="px-6 py-5 flex items-center gap-4 border-b border-slate-100">
                    <div
                        class="h-12 w-12 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold border border-emerald-200">
                        {{ initials }}
                    </div>
                    <div>
                        <h2 class="font-bold text-slate-900 leading-tight">
                            {{ paymentSubmission.student.full_name }}
                        </h2>
                        <p class="text-xs text-slate-500 font-medium">
                            {{ paymentSubmission.student.program_name }}
                            <span class="mx-1 text-slate-300">|</span>
                            Lvl {{ paymentSubmission.student.s_lvl }}
                            <span class="mx-1 text-slate-300">|</span>
                            Set {{ paymentSubmission.student.s_set }}
                        </p>
                    </div>
                </div>


                <div class="px-6 py-6 border-b border-slate-100 text-center">
                    <p class="text-[11px] uppercase font-semibold text-slate-400 tracking-wider">
                        Total Amount Submitted
                    </p>
                    <h1 class="text-4xl font-semibold text-green-600 mt-2 tracking-tight">
                        ₱{{ paymentSubmission.total_amount_paid }}
                    </h1>
                    <p class="text-xs text-slate-500 mt-2">
                        Submitted {{ paymentSubmission.created_at }}
                    </p>
                </div>


                <div class="px-6 py-6 border-b border-slate-100 space-y-4">

                    <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Uploaded Payment Proof
                    </p>

                    <div class="grid gap-4" :class="{
                        'grid-cols-1': paymentSubmission.screenshot_urls.length === 1,
                        'grid-cols-2': paymentSubmission.screenshot_urls.length > 1
                    }">
                        <div v-for="(img, index) in paymentSubmission.screenshot_urls" :key="index"
                            class="rounded-xl overflow-hidden border border-slate-200 shadow-sm hover:shadow-md transition">
                            <BaseImage :src="img" class="h-48" />
                        </div>
                    </div>

                </div>


                <div class="px-6 py-6 space-y-4">
                    <p class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                        Payment Allocation
                    </p>

                    <div v-if="paymentSubmission.fee_items.length == 0">
                        No Fees Allocated in this payment.
                    </div>
                    <div v-else v-for="(item, index) in paymentSubmission.fee_items" :key="index"
                        class="bg-slate-50 rounded-xl p-4 border border-slate-100 flex justify-between items-center">
                        <div>
                            <p class="font-medium text-slate-800">
                                {{ item.fee.category_name }}
                            </p>
                            <p class="text-xs text-slate-400">
                                Previous Balance: ₱{{ item.previous_balance }}
                            </p>
                            <p class="text-xs text-slate-400">
                                Remaining Balance: <span class="text-red-600"> ₱{{ item.fee.balance }}</span>
                            </p>
                        </div>

                        <p class="font-semibold text-slate-900">
                            ₱{{ item.amount_paid }}
                        </p>
                    </div>
                </div>

                <div v-if="paymentSubmission.status !== 'pending'" class="px-6 py-5 rounded-lg border m-5"
                    :class="statusClasses">
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs font-semibold uppercase tracking-wider opacity-80">
                                Review Result
                            </p>
                        </div>

                        <span class="text-xs font-medium px-3 py-1 rounded-full" :class="badgeClasses">
                            {{ paymentSubmission.status }}
                        </span>
                    </div>

                    <div class="mt-4">
                        <p class="text-sm opacity-80">
                            {{ paymentSubmission.remarks || 'No remarks provided.' }}
                        </p>
                    </div>
                    <hr class="opacity-30 mt-2">
                    <div class="mt-4 text-xs text-center opacity-70">
                        Reviewed by
                        <span class="font-medium">{{ paymentSubmission.reviewed_by }}</span> •
                        {{ formatDateTime(paymentSubmission.reviewed_at || "") }}
                    </div>
                </div>

                <div v-if="paymentSubmission.status == 'pending'" class="flex justify-center items-center p-2 mb-5">
                    <Button class="w-[90%]"
                        v-on:click="() => console.log(`To Accept ${paymentSubmissionId}`)">Accept</Button>
                </div>

            </div>

        </div>

    </BaseModal>
</template>