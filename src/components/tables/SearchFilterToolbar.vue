<script setup>
import { Search } from 'lucide-vue-next';
</script>

<template>
    <div class="flex justify-between items-center">
        <div class="flex items-center gap-2">
            <span>Show per Page</span>

            <select className="select select-sm w-fit">
                <option>10</option>
                <option>25</option>
                <option>50</option>
                <option>100</option>
            </select>
        </div>

        <label className="input input-sm w-3xs">
            <Search />
            <input type="search" class="py-2"  placeholder="Search" />
        </label>
    </div>
</template>