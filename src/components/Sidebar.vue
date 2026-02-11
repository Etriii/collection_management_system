<script setup lang="ts">
import { ArrowLeftRight, FileText, History, LayoutDashboard, LayoutGrid, BanknoteArrowDown, UsersRound, HandCoins, GitPullRequestArrow } from 'lucide-vue-next';
import SidebarLink from '@components/SidebarLink.vue';
import icsa_logo from '@assets/icsa_logo.png';

interface Props {
    sidebarWidth: string
    isSidebarOpen?: boolean
    isMobile: boolean
}

const props = defineProps<Props>();

import { watch } from 'vue'

watch(
    () => props.isSidebarOpen,
    (newVal) => {
        if (props.isMobile && newVal) {
            document.body.classList.add('overflow-hidden')
        } else {
            document.body.classList.remove('overflow-hidden')
        }
    }
)

</script>

<template>
    <aside class="left-0 inset-y-0 transition-all duration-300 shadow-lg bg-white" :class="[
        props.sidebarWidth,
        props.isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
        props.isMobile
            ? 'fixed z-40'
            : 'fixed z-30'
    ]">
        <div class="flex items-center gap-4 px-5 py-2 shadow-sm">
            <img :src="icsa_logo" alt="icsa_logo" width="40">
            <p class="text-xl font-semibold">ICCMS</p>
        </div>

        <div class="space-y-1 px-2 py-2 overflow-y-auto h-[93vh]">
            <SidebarLink :icon="LayoutDashboard" label="Dashboard" to="/" exact />
            <SidebarLink :icon="UsersRound" label="Students" to="/students" />
            <SidebarLink :icon="HandCoins" label="Fees" to="/fees" />
            <SidebarLink :icon="GitPullRequestArrow" label="Generated Fees" to="/generated-fees" />
            <SidebarLink :icon="ArrowLeftRight" label="Transaction" to="/transactions" />
            <SidebarLink :icon="BanknoteArrowDown" label="GCash Payments" to="/gcash-payments" />
            <SidebarLink :icon="LayoutGrid" label="Collections" to="/collections" />
            <SidebarLink :icon="FileText" label="Reports" to="/reports" />
            <SidebarLink :icon="History" label="Activity" to="/activities" />
        </div>
    </aside>
</template>