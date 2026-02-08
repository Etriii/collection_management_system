<script setup lang="ts">
import { computed, onMounted, render } from 'vue';
import { useStudentsPaymentsStore } from '../store/useStudentPaymentsStore';
import BaseTable, { type TableColumn } from '@components/tables/BaseTable.vue';
import TablePagination from '@components/tables/TablePagination.vue';
import { formatCurrency } from '@utils/formatCurrency';
import PerPageSelector from '@components/tables/PerPageSelector.vue';
import type { PaymentEntity } from '@pages/transactions/domain/payments_entities';
import { formatDate } from '@utils/dateFormat';

const props = defineProps<{
    student_id: number
}>()

const { fetchStudentPayments, getStudentPaymentsCache, setPage, setPerPage } = useStudentsPaymentsStore()

onMounted(() => {
    fetchStudentPayments(props.student_id)
})

const payments = computed(() => {
    return getStudentPaymentsCache(props.student_id).payments
})

const columns: TableColumn<any>[] = [
    { key: "id", label: "#", align: "center" },
    { key: "category_name", label: "Collection Category", render: (e) => e.fee.category_name },
    { key: "total_amount", label: "Total Amount", render: ((e) => `${formatCurrency(e.amount_paid)}`) },
    { key: "payment_method", label: "Payment Metohd" },
    { key: "payment_submission", label: "Payment Submission" },
    { key: "created_at", label: "Transact Date" ,render:(e)=>`${formatDate(e.created_at)}`},
];

const viewFees = (fee: PaymentEntity) => {
    alert("payment to be viwed is" + JSON.stringify(fee))
    // detailed dapat ang pag view sa fee, like kinsa nag issue ani or so. :>
}

const setPagelocal = (page: number) => {
    setPage(props.student_id, page)
}
const setPerPageLocal = (perPage: number) => {
    setPerPage(props.student_id, perPage)
}
</script>

<template>
    <BaseTable :columns="columns" :rows="payments.data.data" :loading="payments.loading" v-on:rowClick="viewFees">
        <template #toolbar>
            <div class="flex items-center gap-2">
                <PerPageSelector v-model="payments.params.perPage" @onChange="setPerPageLocal" />
                <div class="px-2 py-1 hover:cursor-pointer bg-green-50 border border-gray-300">Filters</div>
            </div>
        </template>

        <!-- <template #cell-status="{ row }">
            <span class="px-2 py-1 text-xs rounded" :class="{
                'bg-green-100 text-green-700': row.status === 'paid',
            }">
                {{ row.status }}
            </span>
        </template> -->

        <template #pagination>
            <TablePagination v-if="payments.params" :current-page="payments.data.current_page"
                :per-page="payments.data.per_page" :total-pages="payments.data.total_pages"
                :total_items="payments.data.total_items" @change="setPagelocal" :loading="payments.loading"/>
        </template>
    </BaseTable>
</template>