<script setup lang="ts">
// import type { PropType } from "vue";

export interface TableColumn<T = unknown> {
  key: string;
  label: string;
  width?: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => string | number;
  grow?: boolean // use this only if you want 1 column to take the whole remaining space of the row
}

const props = withDefaults(
  defineProps<{
    columns: TableColumn[];
    rows: any[];
    loading?: boolean;
    rowClickable?: boolean;
  }>(),
  {
    rowClickable: true,
  }
);

defineSlots<{
  toolbar?: () => any;
  pagination?: () => any;
  [key: `cell-${string}`]: (props: { row: any }) => any;
}>();

const emit = defineEmits<{
  rowClick: [row: any];
}>();
</script>

<template>
  <section class="space-y-3">
    <header v-if="$slots.toolbar" class="flex items-center justify-between gap-2">
      <slot name="toolbar"></slot>
    </header>

    <div class="rounded-lg border border-gray-200">
      <div class="overflow-y-auto ">
        <table class="w-full divide-y divide-gray-200 text-sm text-nowrap min-w-lg">
          <thead class="bg-gray-50 sticky">
            <tr>
              <th v-for="col in columns" :key="col.key"
                class="px-6 py-4 text-xs font-semibold text-gray-500 uppercase tracking-wider" :class="{
                  'text-left': col.align === 'left' || !col.align,
                  'text-center': col.align === 'center',
                  'text-right': col.align === 'right',
                }" :style="{ width: col.width }">
                {{ col.label }}
              </th>
            </tr>
          </thead>

          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-if="loading" v-for="n in 5" :key="n" class="animate-pulse">
              <td v-for="col in columns" :key="col.key" class="px-6 py-[1.126rem]">
                <div class="h-4 w-full rounded bg-gray-200"></div>
              </td>
            </tr>


            <tr v-else-if="!rows.length">
              <td :colspan="columns.length" class="px-6 py-16 text-center text-gray-500">
                <div>
                  <p class="text-xl font-medium text-gray-700 mb-2">No records found</p>
                  <p class="text-sm text-gray-500">Adjust your search or add new data.</p>
                </div>
              </td>
            </tr>

            <tr v-else v-for="row in rows" :key="(row as any).id" class="transition-colors duration-150" :class="{
              'hover:bg-blue-50 cursor-pointer': rowClickable,
            }" @click="rowClickable && emit('rowClick', row)">
              <td v-for="col in columns" :key="col.key" class="px-6 py-4 whitespace-nowrap text-sm text-gray-600"
                :class="{
                  'text-center': col.align === 'center',
                  'text-right': col.align === 'right',
                  'w-full': col.grow,
                }">
                <slot v-if="$slots[`cell-${col.key}`]" :name="`cell-${col.key}`" :row="row"></slot>
                <span v-else>
                  {{ col.render ? col.render(row as any) : (row as any)[col.key] }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

    <footer v-if="$slots.pagination">
      <slot name="pagination"></slot>
    </footer>
  </section>
</template>
