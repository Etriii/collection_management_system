<template>
    <Teleport to="body">
        <transition name="fade">
            <div v-if="isOpen" class="fixed inset-0 z-51 flex items-center justify-center">
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="close"></div>

                <button @click="close"
                    class="fixed top-4 right-4 z-[60] bg-black/60 hover:bg-black text-white rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg">
                    ✕
                </button>

                <div class="relative z-10 max-w-[90vw] max-h-[90vh] flex items-center justify-center">

                    <div v-if="loading"
                        class="animate-pulse bg-gray-300 rounded-lg w-[300px] h-[300px] max-w-[90vw] max-h-[90vh]">
                    </div>

                    <img v-else :src="currentSrc || temp_image" class="object-contain max-w-[90vw] max-h-[90vh]" />

                </div>
            </div>
        </transition>
    </Teleport>
</template>

<script setup>
import { watch, ref, onBeforeUnmount, computed } from "vue";
import { storeToRefs } from 'pinia'

import temp_image from '@assets/image_not_found.png'

import { useImageStore } from "@stores/ui/image";

const loading = ref(false);
const currentSrc = ref("");

const imageStore = useImageStore()
const { isOpen, imageUrl } = storeToRefs(imageStore)
const { close } = imageStore

const handleEsc = (e) => {
    if (e.key === "Escape") close();
};

// Preload function
const preloadImage = (url) => {
    loading.value = true;

    const img = new Image();

    img.onload = () => {
        currentSrc.value = url;
        loading.value = false;
    };

    img.onerror = () => {
        currentSrc.value = fallbackImage;
        loading.value = false;
    };

    img.src = url;
};

watch(isOpen, (open) => {
    if (open) {
        document.body.style.overflow = "hidden"
        window.addEventListener("keydown", handleEsc)

        preloadImage(imageUrl.value)
    } else {
        document.body.style.overflow = ""
        window.removeEventListener("keydown", handleEsc)
    }
})

onBeforeUnmount(() => {
    document.body.style.overflow = "";
    window.removeEventListener("keydown", handleEsc);
});
</script>

<style>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>