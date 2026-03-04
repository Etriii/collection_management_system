<script setup lang="ts">
import StudentDashboard from './presentation/components/StudentDashboard.vue';
import AdminDashboard from './presentation/components/AdminDashboard.vue';
import { useAuth } from '@pages/auth/presentation/composables/useAuth';

const { isStudent } = useAuth()
</script>

<template>
  <StudentDashboard v-if="isStudent()"/>
  <AdminDashboard v-else/>
</template>
