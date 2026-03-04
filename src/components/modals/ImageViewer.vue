<template>
    <Teleport to="body">
        <transition name="fade">
            <div v-if="isOpen" class="fixed inset-0 flex items-center justify-center" :style="{ zIndex: zIndex }">
                <div class="absolute inset-0 bg-black/70 backdrop-blur-sm" @click="close"></div>

                <button @click="close"
                    class="fixed top-4 right-4 z-[60] bg-black/60 hover:bg-black  text-white rounded-full w-10 h-10 flex items-center justify-center text-xl shadow-lg cursor-pointer">
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
import { watch, ref, onBeforeUnmount } from "vue";
import { storeToRefs } from "pinia";
import { useImageStore } from "@stores/ui/image";
import { useModalStackStore } from "@stores/modalStore";
import temp_image from "@assets/image_not_found.png";

const imageStore = useImageStore();
const { isOpen, imageUrl } = storeToRefs(imageStore);
const { close } = imageStore;

const modalStore = useModalStackStore();

const loading = ref(false);
const currentSrc = ref("");
const zIndex = ref(50);
const modalId = ref(null);

const preloadImage = (url) => {
    loading.value = true;

    const img = new Image();

    img.onload = () => {
        currentSrc.value = url;
        loading.value = false;
    };

    img.onerror = () => {
        currentSrc.value = temp_image;
        loading.value = false;
    };

    img.src = url;
};

watch(isOpen, (open) => {
    if (open) {
        modalId.value = modalStore.register(close);
        zIndex.value = modalId.value;

        preloadImage(imageUrl.value);
    } else if (modalId.value !== null) {
        modalStore.unregister(modalId.value);
        modalId.value = null;
    }
});

onBeforeUnmount(() => {
    if (modalId.value !== null) {
        modalStore.unregister(modalId.value);
    }
});
</script>