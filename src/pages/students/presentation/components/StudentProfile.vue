<script setup lang="ts">
import type { StudentEntity } from '@pages/students/domain/entities/StudentEntities';

import { useRouter } from 'vue-router';

const props = defineProps<{
    student?: StudentEntity | null,
    loading: boolean
}>()

const router = useRouter()

</script>

<template>
    <div v-if="loading" class="animate-pulse">
        <div class="bg-white rounded-3xl p-8 shadow-sm border border-slate-100">
            <div class="flex flex-col md:flex-row gap-8 items-start">
                <div class="w-32 h-32 bg-slate-200 rounded-2xl"></div>
                <div class="flex-1 space-y-4 w-full">
                    <div class="flex justify-between items-start">
                        <div class="space-y-3 w-2/3">
                            <div class="h-8 bg-slate-200 rounded-lg w-3/4"></div>
                            <div class="h-5 bg-slate-100 rounded-md w-1/2"></div>
                        </div>
                        <div class="h-8 bg-slate-200 rounded-full w-24"></div>
                    </div>
                    <div class="grid grid-cols-2 gap-4 pt-4">
                        <div class="h-10 bg-slate-50 rounded-xl"></div>
                        <div class="h-10 bg-slate-50 rounded-xl"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <div v-else-if="student" class="space-y-6">
        <div class="bg-white rounded-3xl shadow-lg border border-slate-200/60 overflow-hidden">
            <div class="h-32 bg-gradient-to-r from-violet-600 to-indigo-700 w-full"></div>

            <div class="px-8 pb-8">
                <div class="relative flex flex-col lg:flex-row gap-8 items-center lg:items-end -mt-12 mb-6 flex-wrap">
                    <div class="min-w-32 h-32 bg-white p-2 rounded-3xl shadow-md">
                        <div
                            class="w-full h-full bg-slate-100 rounded-2xl flex items-center justify-center text-slate-400">
                            <span class="text-4xl font-bold">{{ student.s_fname[0] }}{{ student.s_lname[0] }}</span>
                        </div>
                    </div>
                    <div class="flex-1 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                        <div class="text-nowrap">
                            <h1 class="text-3xl font-extrabold text-slate-900 tracking-tight">
                                {{ student.s_fname }} {{ student.s_mname ? student.s_mname[0] : "" }}. {{
                                    student.s_lname }}
                                <span v-if="student.s_suffix" class="text-slate-400 font-medium text-xl">{{
                                    student.s_suffix
                                    }}</span>
                            </h1>
                            <p class="text-slate-500 font-medium flex items-center gap-2">
                                <span
                                    class="bg-slate-100 px-2 py-0.5 rounded text-sm uppercase tracking-wider font-bold">STUDENT
                                    ID</span>
                                {{ student.s_studentID }}
                            </p>
                        </div>
                    </div>
                    <!--  pt-6 border-t border-slate-100 -->
                    <div
                        class="grow grid grid-cols-1 text-center lg:text-left lg:grid-cols-3 gap-6 text-nowrap min-w-sm">
                        <div class="p-2 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Academic
                                Program
                            </p>
                            <p class="text-slate-700 font-bold">{{ student.program_name }}</p>
                        </div>
                        <div class="p-2 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                            <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Year &
                                Section
                            </p>
                            <p class="text-slate-700 font-bold"> {{ student.s_lvl }} - {{ student.s_set }}</p>
                        </div>
                        <!-- <div class="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                <p class="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Email Address</p>
                                <p class="text-slate-700 font-bold">{{student?.user.email ?? 'N/A' }}</p>
                            </div> -->
                        <div class="flex justify-center">
                            <div :class="[
                                'px-6 py-2 rounded-full h-10 text-sm font-bold border-2 transition-all ',
                                student.s_status === 'enrolled' ? 'bg-emerald-50 border-emerald-100 text-emerald-700' :
                                    student.s_status === 'dropped' ? 'bg-rose-50 border-rose-100 text-rose-700' :
                                        'bg-amber-50 border-amber-100 text-amber-700'
                            ]">
                                <span class="relative h-2 w-2 mr-2 inline-block">
                                    <span
                                        :class="['animate-ping absolute inline-flex h-full w-full rounded-full opacity-75', student.s_status === 'enrolled' ? 'bg-emerald-400' : 'bg-rose-400']"></span>
                                    <span
                                        :class="['relative inline-flex rounded-full h-2 w-2', student.s_status === 'enrolled' ? 'bg-emerald-500' : 'bg-rose-500']"></span>
                                </span>
                                {{ student.s_status.toUpperCase() }}
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </div>
    <div v-else="!loading" class="max-w-md mx-auto text-center py-20">
        <div class="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
            <div class="text-slate-300 mb-4 flex justify-center">
                <svg class="w-16 h-16 text-orange-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            </div>
            <h3 class="text-xl font-bold text-slate-900 mb-2">Student Not Found</h3>
            <p class="text-slate-500 mb-6">The student record you're looking for doesn't exist, has been removed, or you
                do
                not have permission to view it.</p>
            <button @click="router.push({ name: 'students' })"
                class="px-6 py-2 bg-ic-primary text-white rounded-xl font-bold hover:bg-ic-primary-hovered transition-colors cursor-pointer">Go
                Back</button>
        </div>
    </div>

</template>