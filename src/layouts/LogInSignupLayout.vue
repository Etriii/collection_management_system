<script setup lang="ts">

const logoImage = '/images/icsa_logo.png';

const appName = import.meta.env.VITE_APP_NAME

</script>

<template>
    <div class="flex min-h-lvh bg-[url('/images/bg.png')] bg-cover bg-center">
        <div
            class="relative hidden w-1/2 min-h-[300px] flex-col items-center justify-center p-4 before:absolute before:inset-0 before:bg-black/50 before:content-[''] lg:flex lg:min-h-screen">
            <img :src=logoImage alt="ICSA Logo" class="z-10 mb-4 size-32">
            <h2 class="z-10 text-center text-xl font-bold text-white lg:text-2xl xl:text-3xl">
                ICSACMS: Institute of Computing Student Association Collection Management System
            </h2>
        </div>

        <div
            class="flex w-full lg:w-1/2 flex-col items-center justify-center bg-[url('/images/bg.png')] bg-cover bg-center p-4 lg:bg-[#ededed] lg:bg-[url('')]">
            <img :src=logoImage alt="ICSA Logo" class="z-10 mb-4 h-24 w-24 lg:hidden" style="ba">
            <h2 class="z-10 mb-5 max-w-xl text-center text-xl font-bold text-white lg:hidden lg:text-2xl xl:text-3xl">
                ICSACMS: Institute of Computing Student Association Collection Management System
            </h2>
            <div class="w-full max-w-[350px] space-y-8">
                <RouterView />
            </div>
            <span class="pt-4 text-sm text-gray-500">
                <p>© {{ new Date().getFullYear() }} {{ appName }}. All rights reserved.</p>
            </span>
        </div>
    </div>
</template>