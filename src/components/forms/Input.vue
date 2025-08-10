<template>
    <div class="flex flex-col w-full space-y-1">
        <label v-if="label" class="mb-1 text-sm text-gray-500">
            {{ label }}
        </label>

        <div class="flex items-center border border-gray-300 rounded-lg px-3 py-2 focus-within:ring-1 
                    focus-within:ring-violet-500">
            <component v-if="leftIcon" :is="leftIcon" class="w-5 h-5 text-gray-500 mr-2" />
            <input v-bind="$attrs" :type="type" v-model="inputValue"
                class="flex-1 outline-none bg-transparent text-sm" />
            <component v-if="rightIcon" :is="rightIcon" class="w-5 h-5 text-gray-500 ml-2 cursor-pointer"
                @click="onRightIconClick" />
        </div>

        <p v-if="error && inputValue" class="mt-1 text-sm text-red-600">
            {{ error }}
        </p>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";

interface Props {
    label?: string;
    type?: string;
    modelValue?: string;
    leftIcon?: any;
    rightIcon?: any;
    error?: string;
    onRightIconClick?: () => void,
}


const props = withDefaults(defineProps<Props>(), {
    type: "text",
    modelValue: "",
    error: "",
});

const emit = defineEmits<{
    (e: "update:modelValue", value: string): void;
}>();

const inputValue = ref(props.modelValue);

watch(inputValue, (val) => {
    emit("update:modelValue", val);
});

watch(
    () => props.modelValue,
    (val) => {
        inputValue.value = val;
    }
);
</script>

<style scoped></style>
