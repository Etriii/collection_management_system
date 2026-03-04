<script setup lang="ts">
// Props for optional customization
const props = defineProps<{
    color?: string      // dot color
    size?: number       // width & height in px
    count?: number      // number of dots
    delay?: number      // base animation delay in seconds
}>()

// Defaults
const color = props.color ?? 'bg-gray-800'
const size = props.size ?? 8        // 2rem = 8px
const count = props.count ?? 3
const delay = props.delay ?? 0.15

// Generate array for dots
const dots = Array.from({ length: count }, (_, i) => i)
</script>

<template>
    <div class="flex items-center gap-2">
        <span v-for="i in dots" :key="i" :class="[
            'rounded-full animate-bounce',
            color
        ]" :style="{
        width: `${size}px`,
        height: `${size}px`,
        animationDelay: `-${delay * (dots.length - i)}s`
    }"></span>
    </div>
</template>
