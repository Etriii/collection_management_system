<template>
    <BaseModal :isModalOpen="props.isOpen" title="Fee Attendance Records" size="full" @onClose="closeModal"
        :closeOnBackdrop="false">
        <div class="space-y-4 p-2">

            <div v-if="loading">
                loading
            </div>
            <div v-else-if="attendance_details && attendance_details.has_record" class="space-y-2">

                <div class="bg-white border border-slate-200 rounded-2xl px-8 py-6 shadow-sm">
                    <div class="flex justify-between items-end">
                        <div>
                            <h2 class="text-base font-semibold text-slate-800 tracking-wide">
                                Event Name: {{ attendance_details.event_name }}
                            </h2>
                            <p class="text-xs text-slate-500 mt-2 leading-relaxed max-w-xl">
                                {{ attendance_details.message }}
                            </p>
                        </div>
                    </div>
                </div>

                <div class="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">

                    <div class="max-h-[400px] overflow-y-auto">
                        <table class="min-w-full text-sm text-left">
                            <thead
                                class="bg-slate-50 text-slate-500 uppercase text-[11px] tracking-widest sticky top-0">
                                <tr>
                                    <th class="px-6 py-4">Date</th>
                                    <th class="px-6 py-4">Morning In</th>
                                    <th class="px-6 py-4">Morning Out</th>
                                    <th class="px-6 py-4">Afternoon In</th>
                                    <th class="px-6 py-4">Afternoon Out</th>
                                    <th class="px-6 py-4 text-right">Fine</th>
                                </tr>
                            </thead>

                            <tbody class="divide-y divide-slate-100">
                                <tr v-for="record in attendance_details.attendance_records" :key="record.id"
                                    class="hover:bg-slate-50 transition">
                                    <td class="px-6 py-4 text-slate-700">
                                        {{ formatDate(record.date) }}
                                    </td>

                                    <td class="px-6 py-4 text-slate-600">
                                        {{ record.morning_check_in ? formatTimeField(record.morning_check_in) : '-' }}
                                    </td>

                                    <td class="px-6 py-4 text-slate-600">
                                        {{ record.morning_check_out ? formatTimeField(record.morning_check_out) : '-' }}
                                    </td>

                                    <td class="px-6 py-4 text-slate-600">
                                        {{ record.afternoon_check_in ? formatTimeField(record.afternoon_check_in) : '-'
                                        }}
                                    </td>

                                    <td class="px-6 py-4 text-slate-600">
                                        {{ record.afternoon_check_out ? formatTimeField(record.afternoon_check_out) :
                                            '-' }}
                                    </td>

                                    <td class="px-6 py-4 text-right font-medium text-slate-700">
                                        {{ formatCurrency(Number(record.total_fines)) }}
                                    </td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <div class="border-t border-slate-200 px-8 py-5 bg-slate-50">
                        <div class="flex justify-end items-center gap-6">
                            <span class="text-xs uppercase tracking-widest text-slate-500">
                                Grand Total
                            </span>
                            <span class="text-lg font-semibold text-slate-800 tracking-wide">
                                {{ formatCurrency(attendance_details.grand_fee_total) }}
                            </span>
                        </div>
                    </div>

                </div>
            </div>

            <div v-else
                class="flex flex-col items-center justify-center text-center py-16 px-6 bg-slate-50 border border-dashed border-slate-300 rounded-2xl">
                <div class="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-5">
                    <span class="text-amber-600 text-xl">⚠</span>
                </div>

                <h3 class="text-base font-semibold text-slate-800 tracking-wide">
                    No Attendance Records Found
                </h3>

                <p class="text-sm text-slate-500 mt-3 max-w-md leading-relaxed">
                    {{ attendance_details?.message }}
                </p>

                <p class="text-xs text-slate-400 mt-6">
                    Once attendance data is recorded, the breakdown will appear here.
                </p>
            </div>

        </div>
    </BaseModal>
</template>

<script setup lang="ts">
import BaseModal from '../BaseModal.vue';
import { computed, watch } from 'vue';
import { formatTimeField, formatDate } from '@utils/dateFormat';
import { formatCurrency } from '@utils/formatCurrency';
import { useFeeAttendanceDetails } from '@pages/fees/presentation/composables/useFeeComposables';
import BaseTable, { type TableColumn } from '@components/tables/BaseTable.vue';

const props = defineProps<{ isOpen: boolean, feeId: number }>();
const isModalOpen = defineModel<boolean>("isOpen", { default: false, })
const closeModal = () => isModalOpen.value = false

watch(() => props.feeId, (newValue) => { fetchAttendanceDetails(newValue) })

const { attendance_details, fetchAttendanceDetails, loading } = useFeeAttendanceDetails()

</script>