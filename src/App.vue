<script setup lang="ts">

import { RouterView } from 'vue-router';
import BaseAlerts from '@components/ui/BaseAlerts.vue';
import BouncingDots from '@components/ui/BouncingDots.vue';
/*
to add a page:
- add a page vue file in pages/ folder
- add a route in the router/router.ts (see vue-router for the docs)

components:
- AuthenticatedLayout component serves as the container
for main pages (Dashboard, StudentLists, Transactions, etc.)

tailwind custom styles:
- navigate to style.css to see more info
*/

import { useAuthStore } from "@pages/auth/presentation/stores/useAuthStore"
import ImageViewer from '@components/modals/ImageViewer.vue';
const auth = useAuthStore()

import { onMounted, onUnmounted } from "vue";
import { useModalStackStore } from '@stores/modalStore';

const modalStore = useModalStackStore();
function handleEsc(e: KeyboardEvent) { if (e.key === "Escape") { modalStore.closeTop(); } }
onMounted(() => { document.addEventListener("keydown", handleEsc); });
onUnmounted(() => { document.removeEventListener("keydown", handleEsc); });
</script>

<template>
  <div v-if="!auth.initialized"
    class="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur flex-col gap-3">
    <BouncingDots color="bg-ic-primary" :size="8" :count="4" :delay="0.2" />
    <span class="text-lg font-bold">
      Authenticating
    </span>
  </div>

  <RouterView v-else />
  <BaseAlerts />
  <ImageViewer />
</template>
