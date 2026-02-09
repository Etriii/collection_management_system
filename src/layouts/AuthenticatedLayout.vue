<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '@components/Sidebar.vue';
import Navbar from '@components/navbar/Navbar.vue';
import { useAuthStore } from '@pages/auth/presentation/stores/useAuthStore';

const route = useRoute();
const pageTitle = computed(() => route.meta.pageTitle as string);

const isSidebarOpen = ref(true);

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
}

// idk unsay efficient way ani pero kani lang sa for now
// adjust the width if needed
const sidebarWidth = 'w-60';
const contentMargin = ref('ml-60');

const store = useAuthStore();
const currentUser = computed(() => store.getCurrentUser)
</script>

<template>
    <div class="h-screen ">

        <Sidebar :sidebarWidth="sidebarWidth" :isSidebarOpen="isSidebarOpen" />

        <div class="flex flex-col grow ">
            <Navbar :isSidebarOpen="isSidebarOpen" :contentMargin="contentMargin" :toggleSidebar="toggleSidebar"
                :pageTitle="pageTitle" :username="currentUser.username" :profilePicPath="currentUser.profile" />

            <!-- content -->
            <div class="p-4  transition-all duration-300 overflow-y-auto"
                :class="[isSidebarOpen ? contentMargin : 'ml-0']">
                <RouterView />
            </div>
        </div>
    </div>
</template>