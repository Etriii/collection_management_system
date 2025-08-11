<template>
    <button :type="btnType" :class="buttonClasses" :disabled="disabled" @click="handleClick">
        <div v-if="loading">
            <LoaderCircle class="w-4 h-4 animate-spin" />
        </div>
        <div v-if="loading">
            {{ loadingText }}
        </div>
        <slot v-else-if="!loading"></slot>

    </button>
</template>

<script setup>
import { computed } from "vue";
import { LoaderCircle } from "lucide-vue-next";

const props = defineProps({
    variant: {
        type: String,
        default: "primary",
    },
    size: {
        type: String,
        default: "md",
    },
    disabled: {
        type: Boolean,
        default: false,
    },
    loading: {
        type: Boolean,
        default: false,
    },
    loadingText: {
        type: String,
        default: ""
    },
    className: {
        type: String,
        default: "",
    },
    btnType: {
        type: String,
        default: "button",
    },
    onClick: {
        type: Function,
        default: () => { },
    },
});

const baseStyles = "rounded transition duration-100 flex justify-center items-center space-x-2";

const variantStyles = computed(() => ({
    primary: "bg-blue-700 text-white border-none hover:bg-blue-800",
    secondary: "bg-gray-500 text-white border-none hover:bg-gray-600",
    danger: "bg-red-600 text-white border-none hover:bg-red-700",
    outline: "border border-blue-700 text-blue-700 bg-transparent hover:bg-blue-700 hover:text-white",
    create: "bg-green-600 text-white border-none hover:bg-green-700",
    read: "bg-blue-500 text-white border-none hover:bg-blue-600",
    update: "bg-yellow-500 text-white border-none hover:bg-yellow-600",
    delete: "bg-red-600 text-white border-none hover:bg-red-700",
    cancel: "bg-gray-300 text-gray-800 hover:bg-gray-400",
}));

const sizeStyles = computed(() => ({
    sm: "px-2 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
}));

const buttonClasses = computed(() => {
    return `${baseStyles} ${variantStyles.value[props.variant]} ${sizeStyles.value[props.size]} ${props.className} ${props.disabled ? "opacity-50 cursor-not-allowed" : " cursor-pointer"}`;
});

const handleClick = (event) => {
    if (!props.disabled) {
        props.onClick(event);
    }
};
</script>

<style scoped></style>
