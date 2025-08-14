<template>
  <div class="w-24 relative" ref="dropdownRef">
    <div ref="buttonRef" @click="toggleDropdown"
      class="cursor-pointer bg-blue-500 text-white rounded text-center hover:bg-blue-600 transition flex items-center justify-between px-2 py-1 space-x-1">
      <span>{{ buttonText }}</span>
      <ChevronDown :class="{ 'rotate-180': isOpen }" class="duration-200" />
    </div>

    <div v-if="isOpen"
      :class="['w-32 border border-gray-300 bg-white rounded-md shadow absolute transition-all right-0 z-10', isAbove ? 'bottom-[110%]' : 'top-[110%]']"
      ref="dropdownContentRef">
      <slot></slot>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';
import { ChevronDown } from 'lucide-vue-next';

// Props
const props = defineProps({
  buttonText: {
    type: String,
    default: 'Actions',
  },
  containerRef: {
    type: Object,
    required: true,
  },
});

// Refs
const isOpen = ref(false);
const isAbove = ref(false);
const buttonRef = ref(null);
const dropdownRef = ref(null);
const dropdownContentRef = ref(null);

const toggleDropdown = () => {
  isOpen.value = !isOpen.value;
};

const handleClickOutside = (event) => {
  if (
    dropdownRef.value &&
    !dropdownRef.value.contains(event.target) &&
    buttonRef.value &&
    !buttonRef.value.contains(event.target)
  ) {
    isOpen.value = false;
  }
};

watch(() => isOpen.value, (newValue) => {
  if (newValue && buttonRef.value && props.containerRef?.value && dropdownContentRef.value) {
    const rows = props.containerRef.value.querySelectorAll('tbody tr');
    if (rows.length < 5) return;

    const buttonRect = buttonRef.value.getBoundingClientRect();
    const containerRect = props.containerRef.value.getBoundingClientRect();
    const dropdownHeight = dropdownContentRef.value.offsetHeight;

    const spaceBelow = containerRect.bottom - buttonRect.bottom;

    isAbove.value = spaceBelow < dropdownHeight;
  }
});

onMounted(() => {
  document.addEventListener('mousedown', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});
</script>

<style scoped>
/* Optional: Add styles for the component */
</style>
