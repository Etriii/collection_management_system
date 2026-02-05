<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import { useStudentsFeesStore } from '../store/useStudentFeeslStore';
import StudentFinancialTabs from './StudentFinancialTabs.vue';
const props = defineProps<{
    student_id: number
}>()

type Tabs = "fees" | "payments" | "submissions";
const selectedTab = ref<Tabs>("fees")

const { fetchStudentFees, getStudentFeesCache } = useStudentsFeesStore()

watch(selectedTab, (newSelectedTab) => {
    if (newSelectedTab == "fees") fetchStudentFees(props.student_id)
})

onMounted(() => {
    fetchStudentFees(props.student_id)
})

const fees = computed(() => {
    return getStudentFeesCache(props.student_id).fees
})

</script>

<template>

    <StudentFinancialTabs v-model="selectedTab" />

    <div v-if="selectedTab == 'fees' && fees.fetched">
        <div>
            {{ JSON.stringify(fees) }}
        </div>
    </div>

</template>