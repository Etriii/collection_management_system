<template>
    <div v-if="open" class="fixed inset-0 z-50 flex items-center justify-center">
        <!-- Backdrop -->
        <div class="absolute inset-0 bg-black/40 backdrop-blur-sm" @click="close" />

        <!-- Modal -->
        <div class="relative w-full max-w-4xl bg-white rounded-xl shadow-xl p-6 md:p-8">
            <!-- Header -->
            <div class="flex items-center justify-between mb-6">
                <h2 class="text-2xl font-semibold text-gray-800">
                    Pay Fees
                </h2>

                <button class="text-gray-400 hover:text-gray-600 transition" @click="close">
                    ✕
                </button>
            </div>

            <!-- Table -->
            <div class="overflow-x-auto rounded-lg border border-gray-200">
                <table class="w-full text-sm">
                    <thead class="bg-gray-50 text-gray-600">
                        <tr>
                            <th class="px-4 py-3 text-left font-medium">Category</th>
                            <th class="px-4 py-3 text-left font-medium">Academic Year</th>
                            <th class="px-4 py-3 text-left font-medium">Semester</th>
                            <th class="px-4 py-3 text-right font-medium">Total</th>
                            <th class="px-4 py-3 text-right font-medium">Balance</th>
                            <th class="px-4 py-3 text-right font-medium">Amount</th>
                        </tr>
                    </thead>

                    <tbody class="divide-y">
                        <tr v-for="fee in fees" :key="fee.id" class="hover:bg-gray-50 transition">
                            <td class="px-4 py-3 text-gray-700 text-left">
                                {{ fee.category_name }}
                            </td>
                            <td class="px-4 py-3 text-left text-gray-600 ">
                                {{ fee.academic_year }}
                            </td>
                            <td class="px-4 py-3 text-left text-gray-600">
                                {{ fee.semester }}
                            </td>
                            <td class="px-4 py-3 text-right text-gray-600">
                                {{ fee.total_amount }}
                            </td>

                            <td class="px-4 py-3 text-right text-gray-600">
                                {{ fee.balance }}
                            </td>
                            <td class="px-4 py-3">
                                <input type="number" min="0" :max="fee.balance" v-model.number="amounts[fee.id]"
                                    class="w-full text-right rounded-md border-gray-300 focus:border-gray-400 focus:ring-0 px-3 py-2" />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div class="flex justify-end mt-6">
                <div class="text-lg font-semibold text-gray-800">
                    Total:
                    <span class="ml-2 text-gray-900">
                        {{ total }}
                    </span>
                </div>
            </div>

            <div class="flex justify-end gap-3 mt-8">
                <button class="px-5 py-2.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
                    @click="close">
                    Cancel
                </button>

                <button
                    class="px-6 py-2.5 rounded-md bg-gray-900 text-white hover:bg-gray-800 transition disabled:opacity-50 disabled:cursor-not-allowed"
                    :disabled="total <= 0" @click="submit">
                    Submit Payment
                </button>
            </div>
        </div>
    </div>
</template>


<script setup lang="ts">
import { ref, computed, watch } from "vue"
import type { FeeEntity } from "@pages/students/domain/entities/StudentEntities"

const props = defineProps<{
    open: boolean
    fees: FeeEntity[]
}>()

const emit = defineEmits<{
    (e: "update:open", v: boolean): void
    (e: "submit", payload: { fee_id: number; amount_paid: number }[]): void
}>()

const amounts = ref<Record<number, number>>({})

watch(
    () => props.fees,
    (fees) => {
        amounts.value = {}
        fees.forEach(f => (amounts.value[f.id] = 0))
    },
    { immediate: true }
)

const total = computed(() =>
    Object.values(amounts.value).reduce((t, v) => t + (v || 0), 0)
)

const submit = () => {
    const payload = props.fees
        .map(fee => ({
            fee_id: fee.id,
            amount_paid: amounts.value[fee.id],
        }))
        .filter(p => p.amount_paid > 0)

    emit("submit", payload)
    close()
}

const close = () => emit("update:open", false)
</script>
