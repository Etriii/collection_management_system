<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import BaseModal from '@components/modals/BaseModal.vue';
import { useStudentPendingFees } from '@pages/students/presentation/composables/useStudentPendingFeesComposables';
import BaseTable, { type TableColumn } from '@components/tables/BaseTable.vue';
import { formatCurrency } from '@utils/formatCurrency';
import { formatDate } from '@utils/dateFormat';
import { usePayFees } from '@pages/transactions/presentation/store/composables/usePayFeesComposables';
import Button from '@components/button/Button.vue';

const props = defineProps<{ student_id: number, }>()
const isModalOpen = defineModel<boolean>("isModalOpen", { default: false, })

const close = () => {
    if (payPendingFeesBulkLoading.value) { cancel_payment_request() }
    isModalOpen.value = false; amounts.value = {}
}

const { fees, loading, fetchPendingFees } = useStudentPendingFees()

watch([isModalOpen], () => { if (isModalOpen.value) fetchPendingFees(props.student_id) })

const columns: TableColumn<any>[] = [
    { key: "id", label: "#", align: "center" },
    { key: "category_name", label: "Collection Category", align: "left" },
    { key: "due_date", label: "Due", align: "right", render: (e) => formatDate(e.due_date) },
    { key: "semester", label: "Year & Sem", align: "right", render: (e) => `${e.academic_year} ${e.semester}` },
    { key: "total_amount", label: "Amount", align: "left", render: (e) => formatCurrency(e.total_amount) },
    { key: "balance", label: "Balance", align: "left", render: (e) => formatCurrency(e.balance) }, { key: "amount", label: "Amount to pay", align: "right" },
];

const amounts = ref<Record<number, number>>({})

watch(fees, (fees) => {
    const next: Record<number, number> = {};
    fees.forEach(f => { next[f.id] = amounts.value[f.id] ?? 0 });
    amounts.value = next;
}, { immediate: true })

const { loading: payPendingFeesBulkLoading, payPendingFeesBulk, cancel_payment_request } = usePayFees()

const submit = async () => {
    const payload = fees.value.map(fee => ({
        fee: fee.id,
        amount_paid: amounts.value[fee.id],
    })).filter(p => p.amount_paid > 0)

    await payPendingFeesBulk(payload); close()
}

const totalFees = computed(() => fees.value.reduce((sum, fee) => sum + Number(fee.balance), 0))

const totalPayment = computed(() => Object.values(amounts.value).reduce((t, v) => t + (v || 0), 0))

// SUNOD NA KUNI E CLEAN MAG FOCUS SA KO SA FEATURES
</script>

<template>
    <BaseModal v-model:is-modal-open="isModalOpen" :title="'Pay Fees'" :close-on-backdrop="false" size="xxl"
        v-on:on-close="close">
        <div class="font-medium pb-2">Pending Fees</div>
        <BaseTable :columns="columns" :rows="fees" :loading="loading">
            <template #cell-amount="{ row }">
                <input type="number" min="0" :max="row.balance" :value="amounts[row.id] ?? 0"
                    @input="amounts[row.id] = +($event.target as HTMLInputElement).value"
                    class="w-full text-right rounded-md border-gray-300 px-3 py-2 border " />
            </template>
        </BaseTable>

        <template #footer>
            <div class="pt-6 flex justify-between items-center border-t flex-col sm:flex-row gap-5">
                <div class=" flex items-center space-x-3">
                    <div class="flex items-center gap-2 text-md text-gray-500">
                        <span>Total Fees</span>
                        <span class="font-medium text-red-600">
                            {{ formatCurrency(totalFees) }}
                        </span>
                    </div>
                    <div class="flex items-center gap-2 text-md text-gray-500">
                        <span>Total Payment</span>
                        <span class="font-semibold text-green-700">
                            {{ formatCurrency(totalPayment) }}
                        </span>
                    </div>
                </div>

                <div class="flex gap-3">
                    <Button type="button" variant="cancel" @click="close" class="">
                        Cancel
                    </Button>

                    <Button v-on:click="submit" :disabled="payPendingFeesBulkLoading || totalPayment <= 0"
                        :loading="payPendingFeesBulkLoading" loading-text="Confirming..."
                        class="px-5 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700">
                        Confirm Payment
                    </Button>
                </div>
            </div>

        </template>
    </BaseModal>
</template>