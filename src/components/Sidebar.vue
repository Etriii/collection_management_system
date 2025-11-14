<script setup lang="ts">
import { ArrowLeftRight, FileText, History, LayoutDashboard, LayoutGrid, UserRoundCog, UsersRound } from 'lucide-vue-next';
import SidebarLink from '@components/SidebarLink.vue';
import icsa_logo from '@assets/icsa_logo.png';

interface Props {
    sidebarWidth: string
    isSidebarOpen?: boolean
}

const props = defineProps<Props>();


</script>

<template>
    <aside 
        class="fixed left-0 inset-y-0 z-30 transition-all duration-300 shadow-lg"
        :class="[props.sidebarWidth, props.isSidebarOpen ? 'translate-x-0': '-translate-x-full']"
    >
        <!-- logo -->
        <div class="flex items-center gap-4 px-5 py-2 shadow-sm">
            <img :src="icsa_logo" alt="icsa_logo" width="40">
            <p class="text-xl font-semibold">ICCMS</p>
        </div>
        
        <div class="space-y-2 px-2 py-2">
            <SidebarLink :icon="LayoutDashboard" label="Dashboard" to="/" exact/>
            <SidebarLink :icon="UsersRound" label="Students" to="/students" />
            <SidebarLink :icon="ArrowLeftRight" label="Transaction" to="/transactions" />
            <SidebarLink :icon="ArrowLeftRight" label="GCash Payments" to="/gcash-payments" />
            <SidebarLink :icon="LayoutGrid" label="Collections" to="/collections" />
            <SidebarLink :icon="FileText" label="Reports" to="/reports" />
            <!-- <SidebarLink :icon="UserRoundCog" label="Users" to="/users" /> -->
            <SidebarLink :icon="History" label="Activity" to="/activities" />
        </div>
    </aside>
</template>