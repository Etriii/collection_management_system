<script setup lang="ts">
import { formatCurrency } from '@utils/formatCurrency';
import { CreditCard, CheckCircle, Clock } from 'lucide-vue-next';
const props = defineProps<{
    fees_summary: {
        total_amount: number;
        total_balance: number;
        loading: boolean;
        fetched: boolean
    };
}>()
</script>

<template>
    <div v-if="props.fees_summary.loading" class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div v-for="i in 3" :key="i" class="bg-white rounded-xl shadow-md p-6 animate-pulse">
            <div class="flex items-center justify-between">
                <div class="space-y-3 w-full">
                    <div class="h-4 w-24 bg-gray-200 rounded"></div>
                    <div class="h-7 w-36 bg-gray-300 rounded"></div>
                </div>
                <div class="h-12 w-12 bg-gray-200 rounded-full"></div>
            </div>
        </div>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 mb-1">Total Fees</p>
                    <p class="text-2xl font-bold text-gray-900">
                        {{ formatCurrency(props.fees_summary.total_amount) }}
                    </p>
                </div>
                <div class="bg-blue-100 p-3 rounded-full">
                    <CreditCard class="h-6 w-6 text-blue-600" />
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 mb-1">Total Paid</p>
                    <p class="text-2xl font-bold text-emerald-600">
                        {{
                            formatCurrency(
                                props.fees_summary.total_amount -
                                props.fees_summary.total_balance
                        )
                        }}
                    </p>
                </div>
                <div class="bg-emerald-100 p-3 rounded-full">
                    <CheckCircle class="h-6 w-6 text-emerald-600" />
                </div>
            </div>
        </div>

        <div class="bg-white rounded-xl shadow-md p-6">
            <div class="flex items-center justify-between">
                <div>
                    <p class="text-sm text-gray-600 mb-1">Balance</p>
                    <p class="text-2xl font-bold text-red-600">
                        {{ formatCurrency(props.fees_summary.total_balance) }}
                    </p>
                </div>
                <div class="bg-red-100 p-3 rounded-full">
                    <Clock class="h-6 w-6 text-red-600" />
                </div>
            </div>
        </div>
    </div>
</template>
