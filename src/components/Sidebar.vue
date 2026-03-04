<script setup lang="ts">
import { ArrowLeftRight, FileText, History, LayoutDashboard, LayoutGrid, BanknoteArrowDown, UsersRound, HandCoins, GitPullRequestArrow, CircleQuestionMark } from 'lucide-vue-next';
import SidebarLink from '@components/SidebarLink.vue';
import icsa_logo from '@assets/icsa_logo.png';
import { watch } from 'vue'
import { useAuth } from '@pages/auth/presentation/composables/useAuth';
interface Props {
    sidebarWidth: string
    isSidebarOpen?: boolean
    isMobile: boolean
}

const props = defineProps<Props>();

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

const { isStudent } = useAuth()

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
            <SidebarLink :icon="LayoutDashboard" label="Dashboard" to="/" exact />
            <SidebarLink v-if="!isStudent()" :icon="UsersRound" label="Students" to="/students" />
            <SidebarLink :icon="HandCoins" label="Fees" to="/fees" />
            <SidebarLink v-if="!isStudent()" :icon="GitPullRequestArrow" label="Generated Fees" to="/generated-fees" />
            <SidebarLink v-if="!isStudent()" :icon="ArrowLeftRight" label="Transaction" to="/transactions" />
            <SidebarLink v-if="!isStudent()" :icon="BanknoteArrowDown" label="GCash Payments" to="/gcash-payments" />
            <SidebarLink v-if="!isStudent()" :icon="LayoutGrid" label="Collections" to="/collections" />
            <SidebarLink v-if="!isStudent()" :icon="FileText" label="Reports" to="/reports" />
            <SidebarLink v-if="!isStudent()" :icon="History" label="Activity" to="/activities" />
            <SidebarLink v-if="isStudent()" :icon="CircleQuestionMark" label="My Transactions" to="/my-transactions" />
            <SidebarLink v-if="isStudent()" :icon="CircleQuestionMark" label="My Gcash payments" to="/my-gcash-payments" />
        </div>
    </aside>
</template>