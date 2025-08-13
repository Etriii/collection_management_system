<script setup>
import { computed } from 'vue';

const activeStyle = 'text-white bg-ic-primary border-ic-primary';

const props = defineProps(['totalEntries', 'currentPage', 'perPage']);

const emit = defineEmits(['pageChange']);

// calculates total pages based on the  show per page value
const totalPages = computed(() => Math.ceil(props.totalEntries / props.perPage));

// responsible for rendering pages in the pagination buttons
const pages = computed(() => {
    const total = totalPages.value;
    const current = props.currentPage;
    const pagesToShow = [];

    if (total <= 6) {
        // If few pages, show all
        for (let i = 1; i <= total; i++) {
            pagesToShow.push(i);
        }
    } else {
        if (current <= 4) {
            // Show first 4 pages
            pagesToShow.push(1, 2, 3, 4, '...', total);
        } else if (current >= total - 3) {
            // Show last 4 pages
            pagesToShow.push(1, '...', total - 3, total - 2, total - 1, total);
        } else {
            // Show around current page
            pagesToShow.push(1, '...', current - 1, current, current + 1, '...', total);
        }
    }

    return pagesToShow;
});

</script>

<template>
    <div class="flex justify-between items-center">
        <div>
            <p>
                Showing 
                <span class="font-semibold">{{ (props.currentPage - 1) * props.perPage + 1 }}</span> 
                to
                <span class="font-semibold">{{ Math.min(props.currentPage * props.perPage, props.totalEntries) }}</span> 
                of 
                <span class="font-semibold">{{ props.totalEntries }}</span> 
                entries
            </p>
        </div>

        <div className="join">
            <!-- prev btn -->
            <button class="join-item btn btn-sm"
                :disabled="props.currentPage === 1"
                @click="emit('pageChange', props.currentPage - 1)"
            >
                Prev
            </button>

            <!-- the btns -->
            <span  v-for="page in pages">
                <button class="join-item btn btn-sm"
                    v-if="page !== '...'"
                    :class="[props.currentPage === page ? activeStyle : '']"
                    @click="emit('pageChange', page)"
                >
                    {{ page }}
                </button>

                <span
                    v-else
                    class="join-item btn btn-sm cursor-default select-none text-gray-400"
                >
                    {{ page }}
                </span>
            </span>

            <!-- next btn -->
            <button class="join-item btn btn-sm"
                :disabled="props.currentPage === totalPages"
                @click="emit('pageChange', props.currentPage + 1)">
                Next
            </button>
        </div>
    </div>
</template>