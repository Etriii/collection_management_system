<script setup lang="ts">
import type{Component} from "lucide-vue-next"
defineProps<{
  text1: number
  textColor?: string
  text2: string
  text3: string
  icon: any
  iconColor?: string
}>()
</script>
<template>
    <div class="p-6 bg-white rounded-xl shadow flex items-center justify-between">
          <div>
            <div :class="['text-3xl font-bold', textColor]">{{ text1.toLocaleString() }}</div>
            <p class="text-sm text-gray-500">{{ text2 }}</p>
            <p class="text-xs text-gray-400">{{ text3 }}</p>
          </div>
          <Component :is="icon" :class="['h-8 w-8', iconColor]"/>
        </div>

</template>
