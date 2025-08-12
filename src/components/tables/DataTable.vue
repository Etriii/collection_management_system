<script setup>
import Pagination from '@components/tables/Pagination.vue';
import SearchFilterToolbar from '@components/tables/SearchFilterToolbar.vue';

const props = defineProps(['columns', 'data']);
console.log(props.columns);

</script>

<template>
    <div class="space-y-4">
        <SearchFilterToolbar />

        <div className="overflow-x-auto rounded-sm border border-base-content/5 bg-base-100">
            <table className="table table-zebra">
                <thead class="text-sm bg-ic-primary text-white">
                    <tr>
                        <th class="py-2">#</th>
                        <th class="py-2" v-for="column in props.columns">{{ column.title }}</th>
                        <th class="py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in data">
                        <td>{{ item.id }}</td>
                        <td>{{ item.student_id }}</td>
                        <td>{{ item.fullname }}</td>
                        <td>{{ item.set }}</td>
                        <td>{{ item.status }}</td>
                        <td>
                            Actions
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    
        <Pagination />
    </div>
</template>