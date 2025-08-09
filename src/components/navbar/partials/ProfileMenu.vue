<script setup lang="ts">
import { LogOut, UserRound } from 'lucide-vue-next';
</script>

<template>
    <div class="absolute right-0 top-13 bg-white shadow border border-gray-300 w-[180px] flex flex-col rounded-md overflow-hidden">
        <RouterLink to="/" class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-300">
            <UserRound />
            <span >My Account</span>
        </RouterLink>

        <RouterLink to="/" class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-300">
            <LogOut />
            <span>Logout</span>
        </RouterLink>

    </div>
</template>