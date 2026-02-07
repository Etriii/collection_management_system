<script setup lang="ts">
import { onMounted } from 'vue';


const props = defineProps<{ fee_id: number }>()

onMounted(() => {
    alert(props.fee_id)
})
</script>

<template>

</template>