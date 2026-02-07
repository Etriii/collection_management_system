<script setup lang="ts">
import { onMounted, watch } from 'vue';
import BaseModal from '@components/modals/BaseModal.vue';
import { useStudentPendingFees } from '@pages/students/presentation/composables/useStudentPendingFeesComposables';

const props = defineProps<{
    student_id: number,
}>()
const isModalOpen = defineModel<boolean>("isModalOpen", {
    default: false,
})

const { fees, loading, fetchPendingFees } = useStudentPendingFees()

watch([isModalOpen], () => {
    if (isModalOpen.value) fetchPendingFees(props.student_id
    )
})

</script>

<template>
    <BaseModal v-model:is-modal-open="isModalOpen" :title="'Create Fee Payment'" :close-on-backdrop="false" size="lg">
        <div class="">
            <div v-if="loading">loading pa lods</div>
            <div class="" v-else>
                <div class="space-y-4">
                    <div v-for="fee in fees" :key="fee.id"
                        class="bg-white rounded-2xl shadow-sm p-5 flex flex-col gap-4 transition hover:shadow-md">
                        <div class="flex flex-col gap-1">
                            <p class="text-lg font-semibold text-gray-800">{{ fee.student.full_name }}</p>
                            <p class="text-sm text-gray-500">
                                {{ fee.student.program_name }} - {{ fee.student.s_set }}{{ fee.student.s_lvl }}
                            </p>
                        </div>

                        <div class="flex flex-col gap-1">
                            <p class="text-sm font-medium text-gray-600">{{ fee.category_name }}</p>
                            <p class="text-xs text-gray-400">
                                {{ fee.academic_year }} | Semester {{ fee.semester }}
                            </p>
                        </div>

                        <div class="flex flex-col gap-1">
                            <p class="text-sm text-gray-500">
                                Total: <span class="font-semibold">{{ parseFloat(fee.total_amount).toLocaleString()
                                }}</span>
                            </p>
                            <p class="text-sm text-gray-500">
                                Balance: <span class="font-semibold">{{ parseFloat(fee.balance).toLocaleString()
                                }}</span>
                            </p>
                        </div>

                        <div class="flex items-center gap-2">
                            <span class="px-3 py-1 rounded-full text-xs font-semibold" :class="{
                                'bg-green-100 text-green-700': fee.status === 'paid',
                                'bg-yellow-100 text-yellow-700': fee.status === 'pending',
                                'bg-red-100 text-red-700': fee.status === 'overdue',
                            }">
                                {{ fee.status }}
                            </span>
                            <p class="text-xs text-gray-400">Due: {{ new Date(fee.due_date).toLocaleDateString() }}</p>
                        </div>

                        <div>
                            <input type="number"
                                class="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                                placeholder="Enter amount to pay" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <template #footer>
            <button type="button" @click="isModalOpen = false">cancel</button>
        </template>
    </BaseModal>
</template>