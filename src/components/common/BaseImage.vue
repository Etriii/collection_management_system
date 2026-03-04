<template>
    <div class="relative group overflow-hidden rounded-xl bg-gray-100 border border-gray-200 shadow-lg  cursor-pointer" :class="wrapperClass"
        @click="clickImage(props.src)">
        <img :src="computedSrc" :alt="alt"
            class="w-full h-full object-cover transition duration-500 ease-out group-hover:scale-105" :class="imgClass"
            @error="onError">

        <div v-if="hoverOverlay"
            class="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition duration-300 flex items-center justify-center">
            <slot name="overlay">
                <span v-if="showZoomIcon"
                    class="opacity-0 group-hover:opacity-100 transition duration-300 text-white text-2xl">
                    <Fullscreen class="size-8"/>
                </span>
            </slot>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue"
import fallbackImage from "@/assets/image_not_found.png"
import { useImageStore } from "@stores/ui/image"
import { Fullscreen } from "lucide-vue-next"

const imageStore = useImageStore()
const clickImage = (url: string) => {
    imageStore.openImageViewer(url)
}

interface Props {
    src: string
    alt?: string
    hoverOverlay?: boolean
    showZoomIcon?: boolean
    wrapperClass?: string
    imgClass?: string
}

const props = withDefaults(defineProps<Props>(), {
    alt: "",
    hoverOverlay: true,
    showZoomIcon: true,
    wrapperClass: "",
    imgClass: "",
})

const hasError = ref(false)

const computedSrc = computed(() =>
    hasError.value ? fallbackImage : props.src
)

const onError = () => {
    hasError.value = true
}

</script>