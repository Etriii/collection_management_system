import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useImageStore = defineStore("image", () => {

    const isOpen = ref<boolean>(false)
    const imageUrl = ref<string>("")

    const openImageViewer = (image_url: string) => {
        isOpen.value = true;
        imageUrl.value = image_url;
    }

    const close = () => {
        isOpen.value = false;
        imageUrl.value = '';
    }

    return {isOpen,imageUrl, openImageViewer, close }
})