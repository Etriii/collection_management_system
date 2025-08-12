<script setup>
import { ChevronLeft, ChevronRight } from 'lucide-vue-next';

const shownDataCount = 10;
const totalDataCount = 20;

const activeStyle = 'text-white bg-ic-primary';
</script>

<template>
    <div class="flex justify-between items-center">
        <div>
            <p>
                Showing 
                <span class="font-bold">{{ shownDataCount }}</span> 
                of 
                <span class="font-bold">{{ totalDataCount }}</span> 
                entries
            </p>
        </div>

        <div className="join">
            <button class="join-item btn btn-sm"><ChevronLeft size="14" /></button>
            <button class="join-item btn btn-sm btn-active" :class="activeStyle">1</button>
            <button class="join-item btn btn-sm">2</button>
            <button class="join-item btn btn-sm">3</button>
            <button class="join-item btn btn-sm">4</button>
            <button class="join-item btn btn-sm"><ChevronRight size="14" /></button>
        </div>
    </div>
</template>