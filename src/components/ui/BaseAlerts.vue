<template>
    <!-- left-1/2 -translate-x-1/2 -->
    <div class="fixed bottom-4 left-4 z-[9999] min-w-[360px] space-y-3 ">
        <transition-group name="toast" tag="div" class="space-y-3">
            <div v-for="alert in alerts" :key="alert.id" :class="[
                'flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg backdrop-blur',
                alertClasses[alert.type]
            ]">
                <component :is="iconMap[alert.type]" class="h-5 w-5 flex-shrink-0 mt-0.5" />

                <p class="flex-1 text-sm font-medium leading-snug">
                    {{ alert.message }}
                </p>

                <button
                    class="rounded-md p-1 opacity-60 transition hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 cursor-pointer"
                    @click="remove(alert.id)">
                    <X class="h-4 w-4" />
                </button>
            </div>
        </transition-group>
    </div>

</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useAlertStore } from '@stores/ui/alert'
import {
    X,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info
} from 'lucide-vue-next'

const alertStore = useAlertStore()
const { alerts } = storeToRefs(alertStore)
const { remove } = alertStore

const alertClasses = {
    success: 'bg-green-100 text-green-700 border border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700',
    error: 'bg-red-100 text-red-700 border border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700',
    warning: 'bg-amber-100 text-amber-700 border border-amber-200 dark:bg-amber-900 dark:text-amber-200 dark:border-amber-700',
    info: 'bg-sky-100 text-sky-700 border border-sky-200 dark:bg-sky-900 dark:text-sky-200 dark:border-sky-700',
};

const iconMap = {
    success: CheckCircle,
    error: XCircle,
    warning: AlertTriangle,
    info: Info
}
</script>

<style scoped>
/* Toast animation */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.25s ease;
}

.toast-enter-from {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
}

.toast-leave-to {
    opacity: 0;
    transform: translateY(-8px) scale(0.98);
}
</style>
