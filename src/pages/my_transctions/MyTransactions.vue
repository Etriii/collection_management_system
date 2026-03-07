<script setup lang="ts">
import { onMounted } from "vue"
import BaseInfiniteScroll from "@components/common/BaseInfiniteScroll.vue"
import BaseSelectInput from "@components/common/BaseSelectInput.vue"

import { usePaymentsInfiniteScroll } from "@pages/transactions/presentation/composables/usePaymentComposables"

const { store, loadMore, hasMore } = usePaymentsInfiniteScroll()

onMounted(() => {
    loadMore()
})

const academicYears = [
    { label: "2024-2025", value: "2024-2025" },
    { label: "2025-2026", value: "2025-2026" }
]

const semesters = [
    { label: "1st", value: "1st" },
    { label: "2nd", value: "2nd" }
]

const applyFilter = async () => {
    await store.applyFilters(
        store.filters.academic_year,
        store.filters.semester
    )
}
</script>

<template>
    <div class="flex flex-col h-full space-y-4 px-3 pt-2">

        <div class="grid grid-cols-2 gap-2 p-2 bg-gray-50/50 rounded-xl border border-gray-100">
            <BaseSelectInput v-model="store.filters.academic_year" :options="academicYears" placeholder="Year"
                class="bg-white" />
            <BaseSelectInput v-model="store.filters.semester" :options="semesters" placeholder="Sem" class="bg-white" />
            <button
                class="col-span-2 py-2.5 bg-blue-600 active:bg-blue-700 text-white font-semibold rounded-lg shadow-sm transition-all text-sm"
                @click="applyFilter">
                Apply Filters
            </button>
        </div>

        <BaseInfiniteScroll class="flex-1 rounded-xl bg-white shadow-sm border border-gray-100" :loading="store.loading"
            :hasMore="hasMore" @load-more="loadMore">
            <div v-for="payment in store.payments" :key="payment.id"
                class="group border-b border-gray-50 last:border-0 p-4 active:bg-gray-50 transition-colors">

                <div class="flex justify-between items-start mb-1">
                    <div class="font-bold text-gray-900 leading-tight">
                        {{ payment.fee.student.full_name }}
                    </div>
                    <div class="font-black text-blue-600">
                        ₱{{ payment.amount_paid }}
                    </div>
                </div>

                <div class="flex items-center gap-1.5 text-[11px] text-gray-500 mb-2">
                    <span class="bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded font-medium">
                        Lvl {{ payment.fee.student.s_lvl }}
                    </span>
                    <span class="truncate">
                        {{ payment.fee.student.program_name }} • Sec {{ payment.fee.student.s_set }}
                    </span>
                </div>

                <div class="flex justify-between items-center mt-3">
                    <div
                        class="text-[11px] font-medium text-gray-400 bg-gray-100 px-2 py-1 rounded-full uppercase tracking-tighter">
                        {{ payment.fee.category_name }}
                    </div>
                    <div class="text-[10px] text-gray-400 italic">
                        {{ payment.payment_method }} • {{ payment.created_at }}
                    </div>
                </div>
            </div>
        </BaseInfiniteScroll>
    </div>
</template>