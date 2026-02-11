<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue';
import { Menu, Bell, ChevronDown } from 'lucide-vue-next';
import ProfileMenu from '@components/navbar/partials/ProfileMenu.vue';
import temp_image from '@assets/default_profile.jpg'

interface Props {
    toggleSidebar: () => void
    contentClass: string
    pageTitle: string
    username: string
    profilePicPath: string
}


const props = defineProps<Props>();


const isProfileMenuOpen = ref(false);
const profileMenuRef = ref<HTMLElement | null>(null);

const toggleProfileMenu = () => {
    isProfileMenuOpen.value = !isProfileMenuOpen.value;
}

const handleClickOutside = (event: MouseEvent) => {
    if (!isProfileMenuOpen.value) return;

    if (profileMenuRef.value && !profileMenuRef.value.contains(event.target as Node)) {
        isProfileMenuOpen.value = false;
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutside);
    console.log(props.profilePicPath)
});

onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside);
});

</script>

<template>
    <div class="flex justify-between shadow-lg px-4 py-2 transition-all duration-300 bg-white z-2 sticky top-0"
        :class="props.contentClass">
        <div class="flex items-center gap-4">
            <button @click="props.toggleSidebar" class="cursor-pointer">
                <Menu></Menu>
            </button>

            <p>{{ props.pageTitle }}</p>
        </div>

        <div class="flex items-center gap-6">
            <a href="" class="relative p-1">
                <Bell />
                <span class="absolute -top-1 -right-2 bg-red-500 text-white text-xs p-1 rounded-full">99</span>
            </a>

            <p>{{ props.username }}</p>

            <div ref="profileMenuRef" class="relative w-10 cursor-pointer" @click="toggleProfileMenu">
                <div class="relative size-10">
                    <div class="absolute inset-0 rounded-full ring-3 ring-gray-300 animate-pulse"></div>
                    <img :src="props.profilePicPath || temp_image" alt="logo"
                        class="relative  h-full w-full rounded-full object-center shadow-lg" />
                </div>

                <ChevronDown :size="15"
                    class="absolute right-0 -bottom-1 bg-gray-200 rounded-full transition-all duration-100 border-2 border-white"
                    :class="[isProfileMenuOpen ? 'rotate-180' : '']" />

                <ProfileMenu v-if="isProfileMenuOpen" />
            </div>
        </div>
    </div>
</template>