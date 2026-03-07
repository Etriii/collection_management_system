<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"

const props = defineProps({
    window: { type: Boolean, default: true }, // If true, listen to window scroll, if false please put a maximum height for the compoenent ex. <BaseInfiniteScroll class="flex-1 px-4 max-h-[500px]"
    loading: { type: Boolean, default: false },
    hasMore: { type: Boolean, default: true },
    threshold: { type: Number, default: 200 }
})

const emit = defineEmits(["load-more"])
const container = ref<HTMLElement | null>(null)

const handleScroll = () => {
    if (props.loading || !props.hasMore) return

    let isBottom = false

    if (props.window) {
        const scrollY = window.scrollY
        const windowHeight = window.innerHeight
        const docHeight = document.documentElement.scrollHeight
        isBottom = docHeight - (scrollY + windowHeight) < props.threshold
    } else if (container.value) {
        const el = container.value
        isBottom = el.scrollHeight - el.scrollTop - el.clientHeight < props.threshold
    }

    if (isBottom) emit("load-more")
}

onMounted(() => {
    const target = props.window ? window : container.value
    target?.addEventListener("scroll", handleScroll, { passive: true })
})

onUnmounted(() => {
    const target = props.window ? window : container.value
    target?.removeEventListener("scroll", handleScroll)
})
</script>

<template>
    <div ref="container"
        class="overflow-y-auto h-full pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent">
        <div class="relative">
            <slot></slot>
        </div>

        <div class="py-10 flex flex-col items-center justify-center">
            <Transition enter-active-class="transition duration-500 ease-out" enter-from-class="opacity-0 translate-y-2"
                enter-to-class="opacity-100 translate-y-0" leave-active-class="transition duration-300 ease-in"
                leave-from-class="opacity-100" leave-to-class="opacity-0" mode="out-in">
                <div v-if="loading" :key="'loading'" class="flex flex-col items-center space-y-3">
                    <div class="relative">
                        <div class="w-8 h-8 rounded-full border-2 border-blue-50 border-t-blue-600 animate-spin"></div>
                        <div
                            class="absolute inset-0 rounded-full blur-[4px] border-2 border-transparent border-t-blue-400/50 animate-spin">
                        </div>
                    </div>
                    <span class="text-[11px] font-semibold text-gray-400 uppercase tracking-widest animate-pulse">
                        Loading more records
                    </span>
                </div>

                <div v-else-if="!hasMore" :key="'end'" class="flex items-center w-full px-8 space-x-4">
                    <div class="h-px flex-1 bg-gradient-to-r from-transparent via-gray-200 to-gray-300"></div>

                    <div class="flex flex-col items-center">
                        <div class="p-1.5 rounded-full bg-gray-50 border border-gray-100 mb-1">
                            <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3 text-gray-400" fill="none"
                                viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                    d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <span class="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em]">
                            Up to date
                        </span>
                    </div>

                    <div class="h-px flex-1 bg-gradient-to-l from-transparent via-gray-200 to-gray-300"></div>
                </div>
            </Transition>
        </div>
    </div>
</template>
