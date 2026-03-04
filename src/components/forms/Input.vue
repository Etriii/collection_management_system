<script setup lang="ts">
import { ref } from "vue"

defineProps<{
    label?: string
    type?: string
    leftIcon?: any
    rightIcon?: any
    error?: string
    title?: string
}>()

const modelValue = defineModel<string>({ default: "" })

const input = ref<HTMLInputElement | null>(null)

defineExpose({ input })

const emit = defineEmits<{
    (e: "right-icon-click"): void
}>()
</script>

<template>
    <div class="flex flex-col ">
        <label v-if="label" class="mb-1 text-sm text-gray-500">
            {{ label }}
        </label>

        <div class="flex items-center border border-gray-300 rounded-lg px-3 py-2
             focus-within:ring-1 focus-within:ring-violet-500">
            <component v-if="leftIcon" :is="leftIcon" class="w-5 h-5 text-gray-500 mr-2" />

            <input ref="input" v-bind="$attrs" :type="type || 'text'" v-model="modelValue"
                class="flex-1 bg-transparent outline-none text-sm" :title="title" />

            <component v-if="rightIcon" :is="rightIcon" class="w-5 h-5 text-gray-500 ml-2 cursor-pointer"
                @click="emit('right-icon-click')" />
        </div>

        <p v-if="error && modelValue" class="mt-1 text-xs text-red-600">
            {{ error }}
        </p>
    </div>
</template>
