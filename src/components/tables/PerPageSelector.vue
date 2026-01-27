<script setup>
defineProps({
  modelValue: {
    type: Number,
    default: 10
  },
  options: {
    type: Array,
    default: () => [10, 25, 50, 75, 100]
  }
});

const emit = defineEmits(['update:modelValue', 'onChange']);

const handleChange = (event) => {
  const val = Number(event.target.value);
  emit('update:modelValue', val);
  emit('onChange', val);
};
</script>

<template>
  <div class="per-page-container text-sm m-2 flex gap-2">
    <span>Show </span>
    <select :value="modelValue" class="border border-gray-400 rounded " @change="handleChange">
      <option v-for="num in options" :key="num" :value="num">
        {{ num }}
      </option>
    </select>
    entries
  </div>
</template>