<script setup lang="ts">
import { ref } from 'vue';
import { Menu, Bell, ChevronDown } from 'lucide-vue-next';
import ProfileMenu from '@components/navbar/partials/ProfileMenu.vue';

interface Props {
    toggleSidebar: any
    isSidebarOpen: boolean
    contentMargin: string
    pageTitle: string
    username: string
    profilePicPath: string
}

const props = defineProps<Props>();


const isProfileMenuOpen = ref(false);

const toggleProfileMenu = () => {
    isProfileMenuOpen.value = !isProfileMenuOpen.value;
}
</script>

<template>
    <div class="flex justify-between shadow-lg px-4 py-2 transition-all duration-300 bg-white z-2"
        :class="[props.isSidebarOpen ? props.contentMargin : 'ml-0']">
        <div class="flex items-center gap-4">
            <button @click="props.toggleSidebar" class="cursor-pointer">
                <Menu></Menu>
            </button>

            <p>{{ props.pageTitle }}</p>
        </div>

        <div class="flex items-center gap-6">
            <!-- notif -->
            <a href="" class="relative p-1">
                <Bell />
                <span class="absolute -top-1 -right-2 bg-red-500 text-white text-xs p-1 rounded-full">99</span>
            </a>

            <!-- user name -->
            <p>{{ props.username }}</p>

            <!-- profile -->
            <div class="relative w-10 cursor-pointer" @click="toggleProfileMenu">
                <img :src="props.profilePicPath" alt="logo" class="hover:outline-3 hover:outline-gray-300 rounded-full">

                <ChevronDown :size="15"
                    class="absolute right-0 -bottom-1 bg-gray-200 rounded-full transition-all duration-100 border-2 border-white"
                    :class="[isProfileMenuOpen ? 'rotate-180' : '']" />

                <!-- profile menu -->
                <ProfileMenu v-if="isProfileMenuOpen" />
            </div>
        </div>
    </div>
</template>