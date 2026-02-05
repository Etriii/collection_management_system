<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useAuthStore } from '@pages/auth/presentation/stores/useAuthStore'
import type { Institute } from '@core/models'

const default_profile = 'https://i.pinimg.com/736x/34/41/65/3441659db45374c4303b0ad3308db348.jpg';

const form = ref({
    first_name: '' as string | null,
    last_name: '' as string | null,
    email: '' as string | null,
    profile: null as string | null,
    groups: [] as string[] | [],
    institute: null as Institute | null
})

const store = useAuthStore();
const currentUser = computed(() => store.getCurrentUser)

const onProfileChange = (event: Event) => {
    const target = event.target as HTMLInputElement
    const file = target.files?.[0]
    if (file) {
        form.value.profile = URL.createObjectURL(file)
    }
}

const change_password = ref({
    currenPassword: '',
    newPassword: '',
    confPassword: '',
})

const removeProfile = () => {
    form.value.profile = default_profile
}

const saveChanges = () => {
    console.log('Form Data:', form.value)
    // Add loading state here if needed 
}

onMounted(() => {
    if (currentUser.value) {
        // Efficiently fill all matching keys
        Object.assign(form.value, currentUser.value)
    }
});
</script>\

<template>
    <div class="min-h-[90vh] bg-slate-50 flex items-center justify-center text-slate-800 font-sans">
        <div
            class="bg-white rounded-2xl shadow-sm border border-slate-200 w-full max-w-4xl overflow-hidden flex flex-col lg:flex-row">

            <div
                class="lg:w-1/3 bg-slate-50/50 p-8 border-b lg:border-b-0 lg:border-r border-slate-100 flex flex-col items-center">
                <button @click="removeProfile"
                    class="text-xs font-semibold text-red-500 hover:text-red-600 transition-colors uppercase tracking-wider cursor-pointer pb-2">
                    Remove Photo
                </button>
                <div class="relative group">
                    <img :src="form.profile ?? default_profile" alt="Profile"
                        class="w-32 h-32 rounded-2xl object-cover shadow-lg border-4 border-white transition-transform duration-300 group-hover:scale-[1.02]" />
                    <label
                        class="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 rounded-2xl cursor-pointer transition-opacity duration-300">
                        <span class="text-white text-xs font-medium">Change Photo</span>
                        <input type="file" accept="image/*" @change="onProfileChange" class="hidden" />
                    </label>
                </div>


                <h2 class="mt-4 font-semibold text-lg text-center">{{ form.first_name || 'User' }} {{ form.last_name ||
                    '' }}</h2>

                <div v-if="form.institute"
                    class="mt-2 flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-full border border-blue-100">
                    <span class="text-[10px] uppercase font-bold tracking-tight">institute:</span>
                    <span class="text-xs font-medium">{{ form.institute.institute_name }}</span>
                </div>

                <hr class="w-full border-slate-200 my-6" />

                <div class="w-full">
                    <p class="text-[10px] uppercase font-bold text-slate-400 mb-3 tracking-widest text-center">Assigned
                        Groups</p>
                    <div class="flex flex-wrap justify-center gap-2">
                        <span v-for="group in form.groups" :key="group"
                            class="px-2.5 py-1 bg-white border border-slate-200 text-slate-600 rounded-lg text-xs font-medium shadow-sm text-nowrap">
                            {{ group }}
                        </span>
                        <span v-if="!form.groups?.length" class="text-xs text-slate-400 italic">No groups
                            assigned</span>
                    </div>
                </div>
            </div>

            <div class="lg:w-2/3 p-8 lg:p-12">
                <header class="mb-8">
                    <h1 class="text-2xl font-bold text-slate-900 tracking-tight">Profile Settings</h1>
                    <p class="text-slate-500 text-sm">Update your identity and contact information.</p>
                </header>

                <form @submit.prevent="saveChanges" class="space-y-6">
                    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        <div class="space-y-1.5">
                            <label class="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">First
                                Name</label>
                            <input v-model="form.first_name" type="text"
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                placeholder="Enter first name" required />
                        </div>

                        <div class="space-y-1.5">
                            <label class="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Last
                                Name</label>
                            <input v-model="form.last_name" type="text"
                                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                                placeholder="Enter last name" required />
                        </div>
                    </div>

                    <div class="space-y-1.5">
                        <label class="text-[11px] font-bold uppercase tracking-wider text-slate-500 ml-1">Email
                            Address</label>
                        <input v-model="form.email" type="email"
                            class="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 focus:bg-white focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition-all outline-none"
                            placeholder="name@company.com" />
                    </div>

                    <div v-if="form.institute"
                        class="bg-slate-50 p-4 rounded-xl border border-dashed border-slate-200 mt-4">
                        <div class="flex items-start gap-3">
                            <div class="p-2 bg-white rounded-lg border border-slate-100 shadow-sm">
                                <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-slate-400" fill="none"
                                    viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                </svg>
                            </div>
                            <div>
                                <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Organization
                                    Unit</p>
                                <p class="text-sm font-medium text-slate-700">{{ form.institute.institute_name }}</p>
                            </div>
                        </div>
                    </div>

                    <div class="flex items-center justify-end gap-3 pt-6">
                        <button type="button"
                            class="px-6 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-medium transition-colors cursor-pointer">
                            Cancel
                        </button>
                        <button type="submit"
                            class="px-8 py-2.5 bg-ic-primary text-white font-medium rounded-xl hover:bg-ic-primary-hovered shadow-lg shadow-slate-200 active:scale-95 transition-all cursor-pointer">
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>
</template>