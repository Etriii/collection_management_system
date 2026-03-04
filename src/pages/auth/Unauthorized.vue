<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-6">
        <div class="max-w-md w-full text-center">

            <div class="mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-red-100 shadow-sm">
                <svg class="h-8 w-8 text-red-600" fill="none" stroke="currentColor" stroke-width="1.8"
                    viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round"
                        d="M12 9v3m0 4h.01M5.455 19h13.09c1.054 0 1.712-1.14 1.18-2.09L13.18 4.91a1.36 1.36 0 00-2.36 0L4.275 16.91c-.532.95.126 2.09 1.18 2.09z" />
                </svg>
            </div>

            <h1 class="mt-6 text-3xl font-semibold text-gray-900">
                Access Denied
            </h1>

            <p class="mt-3 text-gray-500">
                You don’t have permission to view this page.
                Please contact your administrator if you believe this is a mistake.
            </p>

            <div class="mt-8 flex justify-center gap-4">
                <router-link to="/"
                    class="px-5 py-2.5 rounded-xl bg-ic-primary text-white text-sm font-medium shadow hover:bg-ic-primary-hovered transition">
                    Go to Dashboard
                </router-link>

                <button @click="logout"
                    class="px-5 py-2.5 rounded-xl border border-red-300 text-sm font-medium text-red-700 hover:bg-red-100 transition hover:cursor-pointer">
                    Log Out
                </button>
            </div>

        </div>
    </div>
</template>

<script setup lang="ts">
import { useAuth } from './presentation/composables/useAuth';
const { logout } = useAuth()
</script>