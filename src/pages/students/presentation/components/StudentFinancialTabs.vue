<script setup lang="ts">
type Tabs = "fees" | "payments" | "submissions";

const props = defineProps<{
  modelValue: Tabs;
}>();

const emit = defineEmits<{
  (e: "update:modelValue", value: Tabs): void;
}>();

const changeTab = (tab: Tabs) => {
  emit("update:modelValue", tab);
};
</script>

<template>
   <div class="border-b border-gray-200 mb-2">
        <nav class="flex gap-6">
            <button @click="changeTab('fees')" :class="[
                'pb-3 text-sm font-semibold transition-colors relative cursor-pointer',
                modelValue === 'fees'
                    ? 'text-violet-600'
                    : 'text-gray-500 hover:text-gray-800'
            ]">
                Fees
                <span v-if="modelValue === 'fees'"
                    class="absolute left-0 -bottom-[1px] h-0.5 w-full bg-violet-600"></span>
            </button>

            <button @click="changeTab('payments')" :class="[
                'pb-3 text-sm font-semibold transition-colors relative cursor-pointer',
                modelValue === 'payments'
                    ? 'text-violet-600'
                    : 'text-gray-500 hover:text-gray-800'
            ]">
                Payments
                <span v-if="modelValue === 'payments'"
                    class="absolute left-0 -bottom-[1px] h-0.5 w-full bg-violet-600"></span>
            </button>

            <button @click="changeTab('submissions')" :class="[
                'pb-3 text-sm font-semibold transition-colors relative cursor-pointer',
                modelValue === 'submissions'
                    ? 'text-violet-600'
                    : 'text-gray-500 hover:text-gray-800'
            ]">
                Submissions
                <span v-if="modelValue === 'submissions'"
                    class="absolute left-0 -bottom-[1px] h-0.5 w-full bg-violet-600"></span>
            </button>
        </nav>
    </div>
</template>
