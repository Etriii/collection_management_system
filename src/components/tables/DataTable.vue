<script setup>
import { Eye, SquarePen, Trash } from 'lucide-vue-next';
import Pagination from '@components/tables/Pagination.vue';
import SearchFilterToolbar from '@components/tables/SearchFilterToolbar.vue';

const props = defineProps(['columns', 'data']);

</script>

<template>
    <div class="space-y-4">
        <SearchFilterToolbar />

        <div className="overflow-x-auto rounded-sm border border-base-content/5 bg-base-100">
            <table className="table table-zebra">
                <thead class="text-sm bg-ic-primary text-white">
                    <tr>
                        <th class="py-2" v-for="column in props.columns" :key="props.columns.name">{{ column.title }}</th>
                        <th class="py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(item, index) in data" :key="item.id">
                        <td v-for="col in columns"
                            :key="col.name"
                        >
                            {{ item[col.name] }}
                        </td>

                        <td class="flex items-center justify-evenly">
                            <button class="text-blue-500 cursor-pointer"><Eye /></button>
                            <button class="text-yellow-500 cursor-pointer"><SquarePen /></button>
                            <button class="text-red-500 cursor-pointer"><Trash /></button>
                        </td>
                    </tr>
                    <!-- <tr v-for="item in data">
                        <td>{{ item.id }}</td>
                        <td>{{ item.student_id }}</td>
                        <td>{{ item.fullname }}</td>
                        <td>{{ item.set }}</td>
                        <td>{{ item.status }}</td>
                        <td class="flex items-center justify-evenly">
                            <button class="text-blue-500 cursor-pointer"><Eye /></button>
                            <button class="text-yellow-500 cursor-pointer"><SquarePen /></button>
                            <button class="text-red-500 cursor-pointer"><Trash /></button>
                        </td>
                    </tr> -->
                </tbody>
            </table>
        </div>
    
        <Pagination />
    </div>
</template>