<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '@components/Sidebar.vue';
import Navbar from '@components/navbar/Navbar.vue';
import { useScreenWidth } from '@utils/composables/useScreenWidth';
import { useAuth } from '@pages/auth/presentation/composables/useAuth';

const route = useRoute();
const pageTitle = computed(() => route.meta.pageTitle as string);

const isSidebarOpen = ref(false);

const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value;
}

// idk unsay efficient way ani pero kani lang sa for now
// adjust the width if needed
const sidebarWidth = 'w-60';

const contentClass = computed(() => {
    if (isMobile.value) return 'ml-0'
    return isSidebarOpen.value ? 'ml-60' : 'ml-0'
})


const { user } = useAuth();
const currentUser = user.value

const { width } = useScreenWidth()
const isMobile = computed(() => width.value < 768)

</script>
<template>
    <div v-if="isMobile && isSidebarOpen" class="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
        @click="isSidebarOpen = false">
    </div>

    <Sidebar :sidebarWidth="sidebarWidth" :isSidebarOpen="isSidebarOpen" :isMobile="isMobile" :user="user" />

    <Navbar :isSidebarOpen="isSidebarOpen" :contentClass="contentClass" :toggleSidebar="toggleSidebar"
        :pageTitle="pageTitle" :username="currentUser.username" :profilePicPath="currentUser.profile" />

    <div class="p-4 transition-all duration-300 overflow-y-auto min-h-[100vh]" :class="contentClass">
        <RouterView />
    </div>
</template>
