<script setup lang="ts">
import { onMounted } from "vue"
import BaseInfiniteScroll from "@components/common/BaseInfiniteScroll.vue"
import BaseSelectInput from "@components/common/BaseSelectInput.vue"

import { useFeesInfiniteScroll } from "../composables/useFeeComposables"

const { store, loadMore, hasMore } = useFeesInfiniteScroll()

onMounted(() => {
  store.fetchFees()
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
  <div class="flex flex-col  bg-gray-50/50">

    <div class="p-4 bg-white border-b border-gray-100 shadow-sm space-y-3">
      <div class="grid grid-cols-2 gap-2">
        <BaseSelectInput v-model="store.filters.academic_year" :options="academicYears" placeholder="Year"
          class="!bg-gray-50 border-none" />
        <BaseSelectInput v-model="store.filters.semester" :options="semesters" placeholder="Sem"
          class="!bg-gray-50 border-none" />
      </div>
      <button
        class="w-full py-3 bg-blue-600 active:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-100 transition-all flex items-center justify-center gap-2"
        @click="applyFilter">
        <span>Update List</span>
        <svg v-if="store.loading" class="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none" />
          <path class="opacity-75" fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
        </svg>
      </button>
    </div>

    <BaseInfiniteScroll class="flex-1 px-4" :loading="store.loading" :hasMore="hasMore" @load-more="loadMore" >
      <div class="py-4 space-y-3">
        <div v-for="fee in store.fees" :key="fee.id"
          class="group bg-white rounded-2xl p-4 shadow-sm border border-gray-100 active:scale-[0.98] transition-all">
          <div class="flex justify-between items-start">
            <div class="space-y-1 max-w-[70%]">
              <h3 class="font-bold text-gray-900 leading-tight truncate">
                {{ fee.student.full_name }}
              </h3>

              <div class="flex flex-wrap gap-1.5 items-center">
                <span class="text-[10px] px-2 py-0.5 bg-blue-50 text-blue-600 rounded-md font-bold uppercase">
                  Lvl {{ fee.student.s_lvl }}
                </span>
                <span class="text-[10px] text-gray-400 font-medium truncate">
                  {{ fee.student.program_name }}
                </span>
              </div>
            </div>

            <div class="text-right">
              <p class="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Balance</p>
              <p class="text-lg font-black text-red-500 leading-none">
                ₱{{ fee.balance }}
              </p>
            </div>
          </div>

          <div class="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center">
            <span class="text-[11px] font-semibold text-gray-500">
              {{ fee.category_name }}
            </span>
            <span class="text-[10px] px-2 py-1 bg-gray-50 text-gray-400 rounded-full italic">
              Sec {{ fee.student.s_set }}
            </span>
          </div>
        </div>
      </div>
    </BaseInfiniteScroll>
  </div>
</template>