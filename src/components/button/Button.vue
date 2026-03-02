<template>
    <button :type="btnType" :class="buttonClasses" :disabled="disabled || loading" @click="handleClick">
        <LoaderCircle v-if="loading" class="w-4 h-4 animate-spin" />

        <span v-if="loading && loadingText">
            {{ loadingText }}
        </span>

        <slot v-else></slot>
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

    color: {
        type: String,
        default: "",
    },
    hoverColor: {
        type: String,
        default: "",
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

const baseStyles =
    "rounded transition duration-150 flex justify-center items-center gap-2 font-medium";

const variantStyles = {
    primary: "bg-blue-700 text-white hover:bg-blue-800",
    secondary: "bg-gray-500 text-white hover:bg-gray-600",
    danger: "bg-red-600 text-white hover:bg-red-700",
    outline: "border border-blue-700 text-blue-700 bg-transparent hover:bg-blue-700 hover:text-white",
    create: "bg-green-600 text-white hover:bg-green-700",
    read: "bg-blue-500 text-white hover:bg-blue-600",
    update: "bg-yellow-500 text-white hover:bg-yellow-600",
    delete: "bg-red-600 text-white hover:bg-red-700",
    cancel: "bg-gray-200 text-gray-800 hover:bg-gray-300",
};

const sizeStyles = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
};

const buttonClasses = computed(() => {
    const customColorStyles = props.color
        ? `${props.color} hover:${props.hoverColor}`
        : variantStyles[props.variant];

    return `
        ${baseStyles}
        ${customColorStyles}
        ${sizeStyles[props.size]}
        ${props.disabled || props.loading ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
        ${props.className}
    `;
});

const handleClick = (event) => {
    if (!props.disabled && !props.loading) {
        props.onClick(event);
    }
};
</script>


<!-- SAMPLE USE WITH CUSTOM COLOR -->

<!-- <Button
    color="bg-emerald-600 text-white"
    hoverColor="hover:bg-emerald-700">
        Accept Payment
</Button> -->