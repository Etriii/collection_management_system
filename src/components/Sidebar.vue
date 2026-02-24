<script setup lang="ts">
import { ArrowLeftRight, FileText, History, LayoutDashboard, LayoutGrid, BanknoteArrowDown, UsersRound, HandCoins, GitPullRequestArrow } from 'lucide-vue-next';
import SidebarLink from '@components/SidebarLink.vue';
import icsa_logo from '@assets/icsa_logo.png';

interface Props {
    sidebarWidth: string
    isSidebarOpen?: boolean
    isMobile: boolean
    user: UserEntity
}

const props = defineProps<Props>();

import { computed, watch } from 'vue'
import type { UserEntity } from '@pages/auth/domain/entities/user_entity';

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

const isStudent = props.user.groups.includes("Students") ? true : false;

</script>

<template>
    <aside class="left-0 inset-y-0 transition-all duration-300 shadow-2xl bg-white " :class="[
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
            <div v-if="!isStudent">
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
            <div v-else>
                <SidebarLink :icon="HandCoins" label="Fees" to="/fees" />
            </div>
        </div>
    </aside>
</template>