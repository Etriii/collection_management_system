<script setup lang="ts">
import { LogOut, UserRound, ShieldUser } from 'lucide-vue-next';
import { logout } from '@utils/logout.ts';

import { useRouter } from 'vue-router';

const router = useRouter()
</script>

<template>
    <div
        class="z-40 absolute right-0 top-13 bg-white shadow border border-gray-300 w-[180px] flex flex-col rounded-md overflow-hidden">
        <RouterLink to="/my-account" v-slot="{ isActive }">
            <div :class="[isActive ? 'bg-ic-primary text-white' : 'text-gray-500']"
                class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-ic-primary hover:text-white border-b border-white">
                <UserRound />
                <span>My Account</span>
            </div>
        </RouterLink>
        <RouterLink to="/admin-manager" v-slot="{ isActive }">
            <div :class="[isActive ? 'bg-ic-primary text-white' : 'text-gray-500']"
                class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-ic-primary hover:text-white">
                <ShieldUser />
                <span>Admin Manager</span>
            </div>
        </RouterLink>
        <hr class=" text-red-200">
        <div class="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-200" @click="logout(router)">
            <LogOut class="text-red-400" />
            <span class=" text-red-400 font-medium">Logout</span>
        </div>
    </div>
</template>