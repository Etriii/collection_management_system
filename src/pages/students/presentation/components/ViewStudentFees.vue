<script setup lang="ts">
import { computed, onMounted, render } from 'vue';
import { useStudentsFeesStore } from '../store/useStudentFeeslStore';
import BaseTable, { type TableColumn } from '@components/tables/BaseTable.vue';
import TablePagination from '@components/tables/TablePagination.vue';
import type { FeeEntity } from '@pages/fees/domain/entities/FeeEntity';
import { formatCurrency } from '@utils/formatCurrency';
import PerPageSelector from '@components/tables/PerPageSelector.vue';

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
];

const viewFees = (fee: FeeEntity) => {
    alert("fee to be viwed is" + JSON.stringify(fee))
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
    <BaseTable :columns="columns" :rows="fees.data.data" :loading="fees.loading" v-on:rowClick="viewFees">
        <template #toolbar>
            <div class="flex items-center gap-2">
                <PerPageSelector v-model="fees.params.perPage" @onChange="setPerPageLocal" />
                <div class="px-2 py-1 hover:cursor-pointer bg-green-50 border border-gray-300">Filters</div>
            </div>
            <div>
                <button>New Payment</button>
            </div>
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
                :total-pages="fees.data.total_pages" :total_items="fees.data.total_items" @change="setPagelocal" />
        </template>
    </BaseTable>
</template>