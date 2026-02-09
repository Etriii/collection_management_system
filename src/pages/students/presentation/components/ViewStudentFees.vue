<script setup lang="ts">
import { computed, onMounted, render, ref } from 'vue';
import { useStudentsFeesStore } from '../store/useStudentFeeslStore';
import BaseTable, { type TableColumn } from '@components/tables/BaseTable.vue';
import TablePagination from '@components/tables/TablePagination.vue';
import type { FeeEntity } from '@pages/fees/domain/entities/FeeEntity';
import { formatCurrency } from '@utils/formatCurrency';
import PerPageSelector from '@components/tables/PerPageSelector.vue';
import { formatDate } from '@utils/dateFormat';

import ViewFee from '@pages/fees/presentation/component/modals/ViewFee.vue';
import CreateStudentFeePayment from '@pages/transactions/presentation/components/CreateStudentFeePayment.vue';
const props = defineProps<{
    student_id: number
}>()

const { fetchStudentFees, getStudentFeesCache, setPage, setPerPage } = useStudentsFeesStore()

onMounted(() => {
    fetchStudentFees(props.student_id)
})

const fees = computed(() => {
    return getStudentFeesCache(props.student_id).fees
})

const columns: TableColumn<any>[] = [
    { key: "id", label: "#", align: "center" },
    { key: "category_name", label: "Collection Category", },
    { key: "total_amount", label: "Total Amount", render: ((e) => `${formatCurrency(e.total_amount)}`) },
    { key: "balance", label: "Balance", render: ((e) => `${formatCurrency(e.balance)}`) },
    { key: "status", label: "Status" },
    { key: "due_date", label: "Due Date", render: (e) => formatDate(e.due_date) },
];



const setPagelocal = (page: number) => {
    setPage(props.student_id, page)
}
const setPerPageLocal = (perPage: number) => {
    setPerPage(props.student_id, perPage)
}

const selectedFee = ref<number | null>(null)
    
const viewFees = (fee: FeeEntity) => {
    // selectedFee.value = fee.id
    alert(fee)
}
const createPaymentModal = ref<{ isOpen: boolean, student_id: number }>({
    isOpen: false,
    student_id: 0
})

const handleViewFeeForPayments = (id: number) => {
    createPaymentModal.value.isOpen = true
    createPaymentModal.value.student_id = id
}
</script>

<template>
    <!-- <ViewFee v-if="selectedFee" :fee_id="selectedFee" /> -->
    <CreateStudentFeePayment  v-model:is-modal-open="createPaymentModal.isOpen"
        :student_id="createPaymentModal.student_id" />

    <BaseTable :columns="columns" :rows="fees.data.data" :loading="fees.loading" v-on:rowClick="viewFees">
        <template #toolbar>
            <div class="flex items-center gap-2">
                <PerPageSelector v-model="fees.params.perPage" @onChange="setPerPageLocal" />
                <div class="px-2 py-1 hover:cursor-pointer bg-green-50 border border-gray-300">Filters</div>
            </div>
            <button class="px-2 py-1 border border-gray-300 rounded-md cursor-pointer"
                @click="handleViewFeeForPayments(props.student_id)">New
                Payment</button>
        </template>

        <template #cell-status="{ row }">
            <span class="px-2 py-1 text-xs rounded" :class="{
                'bg-green-100 text-green-700': row.status === 'paid',
            }">
                {{ row.status }}
            </span>
        </template>

        <template #pagination>
            <TablePagination v-if="fees.params" :current-page="fees.data.current_page" :per-page="fees.data.per_page"
                :total-pages="fees.data.total_pages" :total_items="fees.data.total_items" @change="setPagelocal" :loading="fees.loading" />
        </template>
    </BaseTable>
</template>