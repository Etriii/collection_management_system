<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useStudentsFeesStore } from '../store/useStudentFeeslStore';
import StudentFinancialTabs from './StudentFinancialTabs.vue';
import { useStudentsPaymentsStore } from '../store/useStudentPaymentsStore';
import ViewStudentFees from './ViewStudentFees.vue';
import ViewStudentPayments from './ViewStudentPayments.vue';

const props = defineProps<{
    student_id: number
}>()

type Tabs = "fees" | "payments" | "submissions";
const selectedTab = ref<Tabs>("fees")

const { fetchStudentFees } = useStudentsFeesStore()
const { fetchStudentPayments } = useStudentsPaymentsStore()

watch(selectedTab, (newSelectedTab) => {
    if (newSelectedTab == "fees") fetchStudentFees(props.student_id)
    if (newSelectedTab == "payments") fetchStudentPayments(props.student_id)
})

onMounted(() => {
    fetchStudentFees(props.student_id)
})

</script>

<template>
    <StudentFinancialTabs v-model="selectedTab" />
    <ViewStudentFees v-if="selectedTab == 'fees'" :student_id="props.student_id" />
    <ViewStudentPayments v-if="selectedTab == 'payments'" :student_id="props.student_id" />
</template>