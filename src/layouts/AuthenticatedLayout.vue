<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import Sidebar from '@components/Sidebar.vue';
import Navbar from '@components/navbar/Navbar.vue';
import { useAuthStore } from '@pages/auth/presentation/stores/useAuthStore';
import { useScreenWidth } from '@utils/composables/useScreenWidth';

const route = useRoute();
const pageTitle = computed(() => route.meta.pageTitle as string);

const isSidebarOpen = ref(true);

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


const store = useAuthStore();
const currentUser = computed(() => store.getCurrentUser)

const { width } = useScreenWidth()
const isMobile = computed(() => width.value < 768)

</script>
<template>
    <div v-if="isMobile && isSidebarOpen" class="fixed inset-0 bg-black/40 z-30 backdrop-blur-sm"
        @click="isSidebarOpen = false">
    </div>

    <Sidebar :sidebarWidth="sidebarWidth" :isSidebarOpen="isSidebarOpen" :isMobile="isMobile" />

    <Navbar :isSidebarOpen="isSidebarOpen" :contentClass="contentClass" :toggleSidebar="toggleSidebar"
        :pageTitle="pageTitle" :username="currentUser.username" :profilePicPath="currentUser.profile" />

    <div class="p-4 transition-all duration-300 overflow-y-auto" :class="contentClass">
        <RouterView />
    </div>
</template>
