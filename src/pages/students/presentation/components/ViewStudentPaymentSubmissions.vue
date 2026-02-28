<script setup lang="ts">
import { computed, onMounted, render } from 'vue';
import BaseTable, { type TableColumn } from '@components/tables/BaseTable.vue';
import TablePagination from '@components/tables/TablePagination.vue';
import { formatCurrency } from '@utils/formatCurrency';
import PerPageSelector from '@components/tables/PerPageSelector.vue';
import type { PaymentEntity } from '@pages/transactions/domain/payments_entities';
import { useStudentsSubmissionsStore } from '../store/useStudentSubmissionsStore';
import { formatDate } from '@utils/dateFormat';
import ViewPaymentSubmissionModal from '@components/modals/paymentSubmissions/ViewPaymentSubmissionModal.vue';
import { ref } from 'vue';
const props = defineProps<{
    student_id: number
}>()

const { fetchStudentPaymentSubmissions, getStudentPaymentSubmissionsCache, setPage, setPerPage } = useStudentsSubmissionsStore()

onMounted(() => {
    fetchStudentPaymentSubmissions(props.student_id)
})

const payments = computed(() => {
    return getStudentPaymentSubmissionsCache(props.student_id).submissions
})

const columns: TableColumn<any>[] = [
    { key: "id", label: "#", align: "center" },
    { key: "student", label: "Student", render: (e) => e.student.full_name },
    { key: "fee_payment_count", label: "Fee paid" },
    { key: "total_amount_paid", label: "Total Amount paid", render: ((e) => `${formatCurrency(e.total_amount_paid)}`) },
    { key: "status", label: "Status" },
    { key: "reviewed_by", label: "Reviewed by" },
    { key: "created_at", label: "Transact Date", render: (e) => `${formatDate(e.created_at)}` },
];
const viewPaymentSubmission = ref<{ isOpen: boolean, paymentSubmissionId: number }>({ isOpen: false, paymentSubmissionId: 0 })
const viewFees = (fee: PaymentEntity) => {
    viewPaymentSubmission.value.paymentSubmissionId = fee.id
    viewPaymentSubmission.value.isOpen = true
}

const setPagelocal = (page: number) => {
    setPage(props.student_id, page)
}
const setPerPageLocal = (perPage: number) => {
    setPerPage(props.student_id, perPage)
}
</script>

<template>
    <ViewPaymentSubmissionModal v-model:is-open="viewPaymentSubmission.isOpen" :payment-submission-id="viewPaymentSubmission.paymentSubmissionId" />
    <BaseTable :columns="columns" :rows="payments.data.data" :loading="payments.loading" v-on:rowClick="viewFees">
        <template #toolbar>
            <div class="flex items-center gap-2">
                <PerPageSelector v-model="payments.params.perPage" @onChange="setPerPageLocal" />
                <div class="px-2 py-1 hover:cursor-pointer bg-green-50 border border-gray-300">Filters</div>
            </div>
        </template>

        <template #cell-status="{ row }">
            <span class="px-2 py-1 text-xs rounded" :class="{
                'bg-green-100 text-green-700': row.status === 'approved',
            }">
                {{ row.status }}
            </span>
        </template>

        <template #pagination>
            <TablePagination v-if="payments.params" :current-page="payments.data.current_page"
                :per-page="payments.data.per_page" :total-pages="payments.data.total_pages"
                :total_items="payments.data.total_items" @change="setPagelocal" :loading="payments.loading" />
        </template>
    </BaseTable>
</template>