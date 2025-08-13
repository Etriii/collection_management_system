<script setup lang="ts">
import { Search } from 'lucide-vue-next';

const emit = defineEmits(['showPerPageUpdated'])

// handles the value change and emit the showPerPageUpdated
// along withe the perPageValue data
const handleValueChange = (event: any) => {
    const perPageValue = event.target.value;
    emit('showPerPageUpdated', parseInt(perPageValue));
}

</script>

<template>
    <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
            <span>Show per Page</span>

            <select className="select select-sm w-fit" @change="handleValueChange">
                <option value="10">10</option>
                <option value="25">25</option>
                <option value="50">50</option>
                <option value="100">100</option>
            </select>
        </div>

        <label className="input input-sm w-3xs">
            <Search />
            <input type="search" class="py-2"  placeholder="Search" />
        </label>
    </div>
</template>