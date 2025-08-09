<script setup lang="ts">
import AuthenticatedLayout from '@layouts/AuthenticatedLayout.vue';

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


// Here ang mga imports
</script>

<template>
  <!-- this will be modified in the future
    as there is no authentication for the moment -->
  <AuthenticatedLayout class="font-poppins">
    Burstfade parin ba to ya?
  </AuthenticatedLayout>
</template>


