<script setup lang="ts">
import { useDebounce } from '@utils/composables/useDebounce';
import { computed } from 'vue';

const props = defineProps<{
    currentPage: number;
    perPage: number;
    totalPages: number;
    total_items: number;
    loading: boolean
}>();

const emit = defineEmits<{
    (e: 'change', page: number): void;
}>();

const pages = computed(() => {
    const total = props.totalPages;
    const current = props.currentPage;
    const pagesToShow: (number | string)[] = [];

    if (total <= 6) {
        for (let i = 1; i <= total; i++) pagesToShow.push(i);
    } else {
        if (current <= 3) {
            pagesToShow.push(1, 2, 3, 4, '...', total);
        } else if (current >= total - 2) {
            pagesToShow.push(1, '...', total - 3, total - 2, total - 1, total);
        } else {
            pagesToShow.push(1, '...', current - 1, current, current + 1, '...', total);
        }
    }
    return pagesToShow;
});

const { debounce } = useDebounce();

const changePage = (currentPage: number) => {
    debounce(() => emit('change', currentPage), 300)
}
</script>   
<template>
    <div
        class="flex flex-col sm:flex-row flex-wrap sm:items-center sm:justify-between gap-4 p-4 border-t border-gray-100 bg-white">

        <div class="text-sm text-gray-600">
            Showing
            <span class="font-semibold text-gray-800">
                {{ total_items == 0 ? 0 : (currentPage - 1) * perPage + 1 }}
            </span>
            –
            <span class="font-semibold text-gray-800">
                {{ Math.min(currentPage * perPage, total_items) }}
            </span>
            of
            <span class="font-semibold text-gray-800">
                {{ total_items }}
            </span>
            entries
        </div>

        <div class="flex items-center gap-1 select-none">

            <button class="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium transition-all
               hover:bg-gray-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                :disabled="currentPage <= 1" @click="changePage(currentPage - 1)">
                ← Prev
            </button>

            <template v-for="(page, index) in pages" :key="index">
                <button v-if="typeof page === 'number'"
                    class="min-w-[38px] px-3 py-2 rounded-lg text-sm font-medium border transition-all" :class="[
                        currentPage === page
                            ? 'bg-ic-primary text-white border-ic-primary shadow-sm cursor-default pointer-events-none'
                            : 'bg-white text-gray-700 border-gray-200 hover:bg-blue-50 hover:border-blue-200 cursor-pointer',

                        props.loading && currentPage === page ? 'animate-spin' : ''
                    ]" :disabled="currentPage === page || props.loading"
                    @click="currentPage !== page && changePage(page)">
                    {{ page }}
                </button>

                <span v-else class="min-w-[38px] px-3 py-2 rounded-lg text-sm text-gray-400 border border-gray-200
                 flex items-center justify-center cursor-default">
                    {{ page }}
                </span>
            </template>

            <button class="px-3 py-2 rounded-lg border border-gray-200 text-sm font-medium transition-all
               hover:bg-gray-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
                :disabled="currentPage >= totalPages" @click="changePage(currentPage + 1)">
                Next →
            </button>

        </div>
    </div>
</template>
