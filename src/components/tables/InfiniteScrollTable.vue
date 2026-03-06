<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import BaseTable, { type TableColumn } from "./BaseTable.vue"

const props = defineProps<{
  columns: TableColumn[]
  rows: any[]
  loading?: boolean
  hasMore?: boolean
  rowClickable?: boolean
}>()

const emit = defineEmits<{
  loadMore: []
  rowClick: [row: any]
}>()

const containerRef = ref<HTMLElement | null>(null)

function handleScroll() {
  if (!containerRef.value || props.loading || !props.hasMore) return

  const { scrollTop, scrollHeight, clientHeight } = containerRef.value

  const nearBottom = scrollTop + clientHeight >= scrollHeight - 100

  if (nearBottom) {
    emit("loadMore")
  }
}

onMounted(() => {
  containerRef.value?.addEventListener("scroll", handleScroll)
})

onBeforeUnmount(() => {
  containerRef.value?.removeEventListener("scroll", handleScroll)
})
</script>

<template>
  <div ref="containerRef" class="max-h-[600px] overflow-y-auto">
    <BaseTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :rowClickable="rowClickable"
      @rowClick="emit('rowClick', $event)"
    >
      <template v-for="(_, slot) in $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope"></slot>
      </template>
    </BaseTable>

    <div v-if="loading && rows.length" class="text-center py-4 text-gray-500 text-sm">
      Loading more...
    </div>

    <div v-if="!hasMore && rows.length" class="text-center py-4 text-gray-400 text-sm">
      No more records
    </div>
  </div>
</template><script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from "vue"
import BaseTable, { type TableColumn } from "./BaseTable.vue"

const props = defineProps<{
  columns: TableColumn[]
  rows: any[]
  loading?: boolean
  hasMore?: boolean
  rowClickable?: boolean
}>()

const emit = defineEmits<{
  loadMore: []
  rowClick: [row: any]
}>()

const containerRef = ref<HTMLElement | null>(null)

function handleScroll() {
  if (!containerRef.value || props.loading || !props.hasMore) return

  const { scrollTop, scrollHeight, clientHeight } = containerRef.value

  const nearBottom = scrollTop + clientHeight >= scrollHeight - 100

  if (nearBottom) {
    emit("loadMore")
  }
}

onMounted(() => {
  containerRef.value?.addEventListener("scroll", handleScroll)
})

onBeforeUnmount(() => {
  containerRef.value?.removeEventListener("scroll", handleScroll)
})
</script>

<template>
  <div ref="containerRef" class="max-h-[600px] overflow-y-auto">
    <BaseTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      :rowClickable="rowClickable"
      @rowClick="emit('rowClick', $event)"
    >
      <template v-for="(_, slot) in $slots" #[slot]="scope">
        <slot :name="slot" v-bind="scope"></slot>
      </template>
    </BaseTable>

    <div v-if="loading && rows.length" class="text-center py-4 text-gray-500 text-sm">
      Loading more...
    </div>

    <div v-if="!hasMore && rows.length" class="text-center py-4 text-gray-400 text-sm">
      No more records
    </div>
  </div>
</template>


<!--  USAGE
<script setup lang="ts">
import { ref } from "vue"
import InfiniteScrollTable from "@/components/InfiniteScrollTable.vue"

const rows = ref<any[]>([])
const loading = ref(false)
const page = ref(1)
const hasMore = ref(true)

async function loadMore() {
  if (loading.value) return

  loading.value = true

  const res = await fetch(`/api/users?page=${page.value}`)
  const data = await res.json()

  rows.value.push(...data.data)

  hasMore.value = data.data.length > 0 // Or i Think should use the current_page > total_pages
  page.value++

  loading.value = false
}

loadMore()
</script>

<template>
  <InfiniteScrollTable
    :columns="columns"
    :rows="rows"
    :loading="loading"
    :hasMore="hasMore"
    @loadMore="loadMore"
  />
</template>
-->
