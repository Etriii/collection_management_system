<!-- Dont import ths. this one is for reference :> -->
<template>
  <div class="p-8 space-x-4">
    <button @click="openModal('success')" class="bg-emerald-600 text-white px-4 py-2 rounded">Create User</button>
    <button @click="openModal('warning')" class="bg-amber-500 text-white px-4 py-2 rounded">Edit Profile</button>
    <button @click="openModal('danger')" class="bg-red-600 text-white px-4 py-2 rounded">Delete Account</button>

    <BaseModal 
      v-model="isModalOpen" 
      :theme="currentTheme" 
      :title="modalTitle"
    >
      <template #icon>
        <span v-if="currentTheme === 'danger'">⚠️</span>
        <span v-else-if="currentTheme === 'success'">✨</span>
        <span v-else>📝</span>
      </template>

      <p>Are you sure you want to perform this action? This cannot be undone.</p>

      <template #footer>
        <button @click="isModalOpen = false" class="px-4 py-2 text-gray-500">Cancel</button>
        <button :class="['px-4 py-2 rounded text-white', buttonClass]">
          Confirm Action
        </button>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import BaseModal from './BaseModal.vue';

const isModalOpen = ref(false);
const currentTheme = ref('neutral');

const modalTitle = computed(() => {
  const titles = {
    success: 'Create New Entry',
    warning: 'Edit Existing Record',
    danger: 'Confirm Deletion',
    neutral: 'Notification'
  };
  return titles[currentTheme.value];
});

const buttonClass = computed(() => {
  const classes = {
    success: 'bg-emerald-600',
    warning: 'bg-amber-500',
    danger: 'bg-red-600',
    neutral: 'bg-gray-800'
  };
  return classes[currentTheme.value];
});

function openModal(theme) {
  currentTheme.value = theme;
  isModalOpen.value = true;
}
</script>
