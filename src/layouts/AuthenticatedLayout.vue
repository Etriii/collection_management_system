<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import temp_image from '@assets/icsa_logo.png'
import Sidebar from '@components/Sidebar.vue';
import Navbar from '@components/navbar/Navbar.vue';

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

const user = localStorage.getItem("userData");
const username = user ? JSON.parse(user)?.username : "Dev Admin";

</script>

<template>
    <div class="flex h-screen overflow-hidden">
        
        <Sidebar :sidebarWidth="sidebarWidth" :isSidebarOpen="isSidebarOpen" />

        <div class="flex flex-col grow ">
            <Navbar :isSidebarOpen="isSidebarOpen" :contentMargin="contentMargin" :toggleSidebar="toggleSidebar" :pageTitle="pageTitle" :username="username" :profilePicPath="temp_image" />

             <!-- content -->
            <div 
                class="p-4  transition-all duration-300 overflow-y-auto"
                :class="[isSidebarOpen ? contentMargin : 'ml-0']"
            >
                <RouterView />
            </div>
        </div>
    </div>
</template>