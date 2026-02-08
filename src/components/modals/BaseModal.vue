<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from "vue";

interface Props {
    isModalOpen: boolean;
    title?: string;
    size?: "sm" | "md" | "lg" | "xl" | "xxl" | "full";
    theme?: ThemeType
    closeOnBackdrop?: boolean;
    closeOnEsc?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    size: "md",
    theme: "info",
    closeOnBackdrop: true,
    closeOnEsc: true,
});

const emit = defineEmits<{
    (e: "update:isModalOpen", value: boolean): void;
    (e: "onClose"): void;
}>();

const isOpen = computed({
    get: () => props.isModalOpen,
    set: (v: boolean) => emit("update:isModalOpen", v),
});

type ThemeType = "info" | "success" | "warning" | "danger" | "neutral";
const themes: Record<ThemeType, any> = {
    neutral: {
        header: "bg-gray-50 border-b border-gray-200",
        title: "text-gray-800",
        icon: "text-gray-500",
        accent: "bg-gray-600",
        body: "bg-gray-50 text-gray-700",
        footer: "bg-gray-100 border-t border-gray-200",
    },

    info: { // READ / VIEW
        header: "bg-blue-100/60 border-b border-blue-200",
        title: "text-blue-800",
        icon: "text-blue-500",
        accent: "bg-blue-600",
        body: "bg-blue-50/30 text-blue-900",
        footer: "bg-blue-50/20 border-t border-blue-100",
    },

    success: { // CREATE / COMPLETE
        header: "bg-emerald-100/60 border-b border-emerald-200",
        title: "text-emerald-800",
        icon: "text-emerald-500",
        accent: "bg-emerald-600",
        body: "bg-emerald-50/30 text-emerald-900",
        footer: "bg-emerald-50/20 border-t border-emerald-100",
    },

    warning: { // UPDATE / EDIT
        header: "bg-amber-100/60 border-b border-amber-200",
        title: "text-amber-800",
        icon: "text-amber-500",
        accent: "bg-amber-600",
        body: "bg-amber-50/30 text-amber-900",
        footer: "bg-amber-50/20 border-t border-amber-100",
    },

    danger: { // DELETE / ERROR
        header: "bg-red-100/60 border-b border-red-200",
        title: "text-red-800",
        icon: "text-red-500",
        accent: "bg-red-600",
        body: "bg-red-50/30 text-red-900",
        footer: "bg-red-50/20 border-t border-red-100",
    },
};


const currentTheme = computed(() => themes[props.theme]);

// const modalRef = ref<HTMLElement | null>(null);

function close() { isOpen.value = false; emit("onClose") }

function onBackdropClick() { if (props.closeOnBackdrop) close(); }

onMounted(() => { document.addEventListener("keydown", onKeydown); });
watch(isOpen, (open) => { document.body.style.overflow = open ? "hidden" : ""; });
function onKeydown(e: KeyboardEvent) { if (e.key === "Escape" && props.closeOnEsc && isOpen.value) close() }

onMounted(() => document.addEventListener("keydown", onKeydown));
onUnmounted(() => { document.body.style.overflow = ""; document.removeEventListener("keydown", onKeydown) });
</script>

<template>
    <Teleport to="body">
        <Transition name="fade">
            <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                @click.self="onBackdropClick">

                <div ref="modalRef" :class="['shadow-lg  mx-4 flex flex-col rounded-2xl overflow-hidden  border border-gray-300 bg-gray-50  max-h-[92%] max-w-[92%]',
                    currentTheme.container,
                    size === 'sm' && 'max-w-sm',
                    size === 'md' && 'max-w-md',
                    size === 'lg' && 'max-w-lg',
                    size === 'xl' && 'max-w-xl',
                    size === 'xxl' && 'max-w-[45rem]',
                ]" role="dialog" aria-modal="true">

                    <header :class="['flex items-center justify-between px-6 py-4 rounded-t-xl', currentTheme.header]">
                        <h2 :class="['text-lg font-semibold', currentTheme.title]">
                            <slot name="title">{{ title }}</slot>
                        </h2>
                        <button :class="['transition-colors cursor-pointer hover:font-bold', currentTheme.closeBtn]"
                            aria-label="Close" @click="close">
                            ✕
                        </button>
                    </header>

                    <section :class="['px-6 py-4 overflow-y-auto overflow-x-hidden', currentTheme.body]">
                        <slot></slot>
                    </section>

                    <footer v-if="$slots.footer" :class="['px-6 py-4', currentTheme.footer]">
                        <slot name="footer"></slot>
                    </footer>
                </div>
            </div>
        </Transition>
    </Teleport>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>