<script setup lang="ts">

/*
PROPS
to - link on what page to render (see router/index.ts for more details about the routes)
*/
interface Props {
    icon: any
    label: string
    to: string
    exact?: boolean
}

const props = defineProps<Props>();

/* 
- the custom v-slot handles all activeClass styling and navigation
*/
</script>

<template>
    <RouterLink :to="to" custom v-slot="{ isActive, isExactActive, href, navigate }" exact>
        <a :href="href" @click="navigate"
            class="flex items-center gap-2 text-sm px-3 py-1 rounded-sm hover:bg-ic-primary hover:text-white"
            :class="[(exact ? isExactActive : isActive) ? 'bg-ic-primary text-white' : 'text-gray-500']">
            <component :is="props.icon" class="hover:bg-ic-primary" />
            <span :class="[(exact ? isExactActive : isActive) ? 'font-medium' : '']">{{ props.label }}</span>
        </a>
    </RouterLink>
</template>