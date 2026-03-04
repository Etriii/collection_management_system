<template>
    <div class="relative w-full">
        <select :value="modelValue" @change="$emit('update:modelValue', $event.target.value)" :disabled="loading"
            class="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 disabled:opacity-60 disabled:cursor-not-allowed appearance-none pr-10">
            <option v-if="loading" disabled>{{ loadingText }}</option>
            <option v-for="option in options" :key="option.value" :value="option.value">
                {{ option.label }}
            </option>
        </select>

        <svg v-if="loading"
            class="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 animate-spin text-gray-500"
            xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
        </svg>

        <svg v-else
            class="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none"
            fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
    </div>
</template>

<script setup>
defineProps({
    modelValue: [String, Number],
    options: {
        type: Array,
        default: () => [],
    },
    loading: {
        type: Boolean,
        default: false,
    },
    loadingText: {
        type: String,
        default: 'Loading...',
    },
})

defineEmits(['update:modelValue']) 
</script>