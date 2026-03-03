<script setup lang="ts">
import { computed, watch } from 'vue';
import BaseModal from '../BaseModal.vue';
import { useFee } from '@pages/fees/presentation/composables/useFeeComposables';
import { formatDate } from '@utils/dateFormat';
import { formatCurrency } from '@utils/formatCurrency';
import ViewAttendanceDetails from './ViewAttendanceDetails.vue';
import { useViewModalById } from '../composables/useModalsComposables';

const props = defineProps<{
    isOpen: boolean,
    feeId: number
}>()
const isModalOpen = defineModel<boolean>("isOpen", { default: false, })
const close = () => isModalOpen.value = false

const { loading, fee, fetchFee } = useFee()

watch(() => props.isOpen, (newVal) => {
    if (newVal) fetchFee(props.feeId)
})

const initials = computed(() => {
    return fee.value?.student.full_name
        .split(' ')
        .map(n => n[0])
        .join('')
        .slice(0, 2);
});

const { isFeeModalOpen, viewFee } = useViewModalById() //feeId,
</script>

<template>
    <ViewAttendanceDetails v-model:is-open="isFeeModalOpen" />
    <BaseModal :isModalOpen="isModalOpen" title="View Fee" size="xxl" v-on:onClose="close" :closeOnBackdrop="false">
        <div v-if="loading"
            class="w-md lg:w-lg  mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden animate-pulse">
            <div class="px-8 py-3 border-b border-slate-100 bg-slate-50/30">
                <div class="flex items-center justify-between">
                    <div class="h-3 bg-slate-200 rounded w-1/4"></div>
                    <div class="h-7 bg-slate-200 rounded-full w-20"></div>
                </div>
            </div>

            <div class="px-6 py-5 flex items-center gap-4">
                <div class="h-12 w-12 rounded-full bg-slate-200"></div>
                <div class="flex-1 space-y-2">
                    <div class="h-5 bg-slate-200 rounded w-1/2"></div>
                    <div class="h-3 bg-slate-200 rounded w-3/4"></div>
                </div>
            </div>

            <div class="px-6 pb-6 space-y-4">
                <div class="bg-slate-50 rounded-xl p-4 border border-slate-100 space-y-4">
                    <div class="flex justify-between">
                        <div class="h-3 bg-slate-200 rounded w-16"></div>
                        <div class="h-4 bg-slate-200 rounded w-24"></div>
                    </div>
                    <div class="space-y-3">
                        <div class="flex justify-between">
                            <div class="h-3 bg-slate-200 rounded w-20"></div>
                            <div class="h-3 bg-slate-200 rounded w-16"></div>
                        </div>
                        <div class="flex justify-between">
                            <div class="h-3 bg-slate-200 rounded w-20"></div>
                            <div class="h-3 bg-slate-200 rounded w-16"></div>
                        </div>
                        <div class="pt-2 border-t border-slate-200 flex justify-between items-center">
                            <div class="h-4 bg-slate-200 rounded w-24"></div>
                            <div class="h-6 bg-rose-100 rounded w-20"></div>
                        </div>
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <div class="h-2 bg-slate-100 rounded w-1/2"></div>
                        <div class="h-3 bg-slate-200 rounded w-full"></div>
                    </div>
                    <div class="space-y-2 flex flex-col items-end">
                        <div class="h-2 bg-slate-100 rounded w-1/2"></div>
                        <div class="h-3 bg-slate-200 rounded w-full"></div>
                    </div>
                </div>
            </div>

            <div class="px-6 py-4 bg-violet-50 flex justify-between items-center">
                <div class="h-3 bg-violet-200 rounded w-1/3"></div>
                <div class="h-8 bg-violet-200 rounded-lg w-24"></div>
            </div>
        </div>

        <div v-if="!loading && fee" class="space-y-6 ">
            <div
                class="w-md lg:w-lg mx-auto bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden font-sans text-lg">
                <div class="px-8 py-3 border-b border-slate-100 bg-gradient-to-r from-white via-slate-50/40 to-white">
                    <div class="flex items-center justify-between">

                        <p class="text-sm font-medium text-slate-400 tracking-widest">
                            Fee Reference ID #{{ fee.id }}
                        </p>

                        <span
                            class="px-5 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm border transition-all duration-200"
                            :class="{
                                'bg-yellow-50 text-yellow-700 border-yellow-200/60': fee.status === 'pending',
                                'bg-emerald-50 text-emerald-700 border-emerald-200/60': ['paid', 'waived'].includes(fee.status),
                                'bg-rose-50 text-rose-700 border-rose-200/60': fee.status === 'overdue'
                            }">
                            {{ fee.status.charAt(0).toUpperCase() + fee.status.slice(1) }}
                        </span>

                    </div>
                </div>


                <div class="px-6 py-5 flex items-center gap-4">
                    <div
                        class="h-12 w-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold border border-indigo-200">
                        {{ initials }}
                    </div>
                    <div>
                        <h2 class="font-bold text-slate-900 leading-tight">{{ fee.student.full_name }}</h2>
                        <p class="text-xs text-slate-500 font-medium">
                            {{ fee.student.program_name }} <span class="mx-1 text-slate-300">|</span>
                            Lvl {{ fee.student.s_lvl }} <span class="mx-1 text-slate-300">|</span>
                            Set {{ fee.student.s_set }}
                        </p>
                    </div>
                </div>

                <div class="px-6 pb-6 space-y-4">
                    <div class="bg-slate-50 rounded-xl p-4 border border-slate-100">
                        <div class="flex justify-between items-center mb-3">
                            <span class="text-xs font-semibold text-slate-400 uppercase">Service</span>
                            <span class="text-sm font-bold text-slate-700">{{ fee.category.category_name }}</span>
                        </div>

                        <div class="space-y-2">
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-500 text-xs">Assessment Amount</span>
                                <span class="font-medium text-slate-800">{{ formatCurrency(fee.total_amount) }}</span>
                            </div>
                            <div class="flex justify-between text-sm">
                                <span class="text-slate-500 text-xs">Collection Fee</span>
                                <span class="font-medium text-slate-800">{{
                                    formatCurrency(fee.category.collection_fee) }}</span>
                            </div>
                            <div class="pt-2 mt-2 border-t border-slate-200 flex justify-between items-center">
                                <span class="font-bold text-slate-900 text-sm">Outstanding Balance</span>
                                <span class="text-xl font-black text-rose-600">{{ formatCurrency(fee.balance)
                                    }}</span>
                            </div>
                        </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div class="space-y-1">
                            <p class="text-[10px] font-bold text-slate-400 uppercase">Academic Term</p>
                            <p class="text-xs font-semibold text-slate-700">{{ fee.semester }} Sem, {{
                                fee.academic_year }}</p>
                        </div>
                        <div class="space-y-1 text-right">
                            <p class="text-[10px] font-bold text-slate-400 uppercase">Due Date</p>
                            <p class="text-xs font-semibold text-slate-700">{{ formatDate(fee.due_date) }}</p>
                        </div>
                    </div>
                </div>

                <div class="px-6 py-4 bg-violet-500 flex justify-between items-center">
                    <div class="text-[10px]  text-white italic grow text-md font-bold tracking-wider">
                        Issued by: {{ fee.issued_by }}
                    </div>
                    <button v-if="fee.category.category_name == 'Attendance'"
                        class="bg-white/10 hover:cursor-pointer hover:bg-white/20 text-white text-[10px] font-bold px-4 py-2 rounded-lg transition-all uppercase tracking-wider"
                        v-on:click="viewFee(fee.id)">
                        View Attendance Details
                    </button>
                </div>
            </div>
        </div>
        <div v-else-if="!loading" class="flex flex-col items-center justify-center p-12 w-full lg:max-w-4xl mx-auto 
            rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50">

            <div class="mb-4 p-3 bg-white rounded-full shadow-sm">
                <svg class="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="current-path-here-or-simple-icon" />
                    <circle cx="12" cy="12" r="9" stroke="currentColor" />
                    <path d="M9 12h6" stroke="currentColor" />
                </svg>
            </div>

            <h3 class="text-lg font-medium text-slate-900">No records found</h3>
            <p class="mt-1 text-sm text-slate-500">There are currently no fees associated with this account.</p>
        </div>
    </BaseModal>
</template>