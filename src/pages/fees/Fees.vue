<script setup lang="ts">
import AdminFee from './presentation/components/AdminFee.vue';
import StudentFee from './presentation/components/StudentFee.vue';
import { useAuth } from '@pages/auth/presentation/composables/useAuth';

const { isStudent } = useAuth()
</script>

<template>
    <StudentFee v-if="isStudent()" />
    <AdminFee v-else />
</template>
