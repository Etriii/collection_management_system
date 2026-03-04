<script setup lang="ts">
import { Eye, SquarePen, Trash } from 'lucide-vue-next'
import PaginationControls from '@components/tables/PaginationControls.vue'
import SearchFilterToolbar from '@components/tables/SearchFilterToolbar.vue'

export interface Header {
  title: string
  name: string
}

const props = defineProps<{
  headers: Header[]
  data: any[]
  perPage: number
  currentPage: number
  totalEntries: number
  clickable?: boolean
}>()

const emit = defineEmits<{
  (e: 'rowClick', row: any): void
  (e: 'view', row: any): void
  (e: 'edit', row: any): void
  (e: 'delete', row: any): void
  (e: 'pageChange', page: number): void
  (e: 'perPageChange', perPage: number): void
}>()

const handleShowPerPageUpdate = (value: number) => {
  emit('perPageChange', value)
}
</script>

<template>
  <div class="space-y-4">
    <SearchFilterToolbar @showPerPageUpdated="handleShowPerPageUpdate" />

    <div class="rounded-sm border border-base-content/5 bg-base-100 overflow-x-auto">
      <table class="table table-zebra">
        <thead class="text-sm bg-ic-primary text-white">
          <tr>
            <th
              v-for="header in headers"
              :key="header.name"
              class="py-2"
            >
              {{ header.title }}
            </th>
            <th class="py-2">Action</th>
          </tr>
        </thead>

        <tbody>
          <tr
            v-for="(item, index) in data"
            :key="item.id"
            class="hover"
            :class="{ 'cursor-pointer': clickable }"
            @click="clickable && emit('rowClick', item)"
          >
            <td v-for="header in headers" :key="header.name">
              {{ item[header.name] }}
            </td>

            <!-- Actions -->
            <td @click.stop>
              <div
                :class="{
                  'dropdown dropdown-end': true,
                  'dropdown-bottom': index !== data.length - 1,
                  'dropdown-top': index === data.length - 1
                }"
              >
                <div tabindex="0" role="button" class="btn btn-sm">
                  Action
                </div>

                <div
                  tabindex="0"
                  class="dropdown-content menu bg-base-100 w-36 rounded-box z-10 shadow-lg border border-gray-200"
                >
                  <button
                    class="text-blue-500 flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                    @click.stop="emit('view', item)"
                  >
                    <Eye class="size-5" />
                    <span>View</span>
                  </button>

                  <button
                    class="text-yellow-500 flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                    @click.stop="emit('edit', item)"
                  >
                    <SquarePen class="size-5" />
                    <span>Edit</span>
                  </button>

                  <button
                    class="text-red-500 flex items-center space-x-2 p-2 hover:bg-gray-100 rounded"
                    @click.stop="emit('delete', item)"
                  >
                    <Trash class="size-5" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </td>
          </tr>

          <tr v-if="!data.length">
            <td :colspan="headers.length + 1" class="text-center py-6">
              No data found
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaginationControls
      :totalEntries="totalEntries"
      :currentPage="currentPage"
      :perPage="perPage"
      @pageChange="emit('pageChange', $event)"
    />
  </div>
</template>
