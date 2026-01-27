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
const auth = useAuthStore()

// Here ang mga imports
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
</template>
