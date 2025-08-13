<script setup lang="ts">
import { Eye, SquarePen, Trash } from 'lucide-vue-next';
import PaginationControls from '@components/tables/PaginationControls.vue';
import SearchFilterToolbar from '@components/tables/SearchFilterToolbar.vue';

/*  
Props:

headers -> column headers
data -> Array of objects
perPage -> number of data shown (ex. 10, 25, 50, or 100)
currentPage -> current page in the pagination control ex. page 1, page 21
url -> url to be used. Used on viewing, editing, and deleting
*/


const props = defineProps([
    'headers', 'data', 'perPage', 'currentPage', 'url'
]);

const emit = defineEmits(['pageChange', 'perPageChange']);


// filters data based on total data length / perPage
// idk if this is usable since paginated naman ang backend...
// but it works on testdata Array(Objects)
const filteredData = () => {
    // console.log("Starting: ", (props.perPage * props.currentPage) - props.perPage - 1);
    // console.log("Last", props.perPage * props.currentPage);

    return props.data.filter((item: any, index: any) => 
        index > (props.perPage * props.currentPage) - props.perPage - 1
        && 
        index < props.perPage * props.currentPage
    );
}

// emitting the perPageChange function when the show per page value is changed
const handleShowPerPageUpdate = (perPageValue: number) => {
    emit('perPageChange', perPageValue);
};

</script>

<template>
    <div class="space-y-4">
        <SearchFilterToolbar @showPerPageUpdated="handleShowPerPageUpdate" />

        <div className="overflow-x-auto rounded-sm border border-base-content/5 bg-base-100">
            <table className="table table-zebra">
                <thead class="text-sm bg-ic-primary text-white">
                    <tr>
                        <th class="py-2" v-for="header in props.headers" :key="props.headers.name">{{ header.title }}</th>
                        <th class="py-2">Action</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="item in filteredData()" :key="item.id">
                        <td v-for="header) in props.headers"
                            :key="header.name"
                        >
                            {{ item[header.name] }}
                        </td>

                        <td class="flex items-center justify-evenly">
                            <button class="text-blue-500 cursor-pointer"><Eye /></button>
                            <button class="text-yellow-500 cursor-pointer"><SquarePen /></button>
                            <button class="text-red-500 cursor-pointer"><Trash /></button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    
        <PaginationControls 
            :totalEntries="props.data.length" 
            :currentPage="props.currentPage"
            :perPage="props.perPage"
            @pageChange="emit('pageChange', $event)"
        />
    </div>
</template>