<script setup>
import { ref } from 'vue'

// Form state
const form = ref({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    gender: '',
    id: '1559 000 7788 8DER', // example
    taxNumber: '',
    taxCountry: 'Nigeria',
    address: '',
})

// Profile image state
const profilePreview = ref('https://via.placeholder.com/100')

const onProfileChange = (event) => {
    const file = event.target.files[0]
    if (file) {
        profilePreview.value = URL.createObjectURL(file)
    }
}

const removeProfile = () => {
    profilePreview.value = 'https://via.placeholder.com/100'
}

const saveChanges = () => {
    console.log('Form Data:', form.value)
    alert('Profile saved successfully!')
}
</script>

<template>
    <div class="bg-gray-100 flex items-center justify-center min-h-screen p-4">
        <div class="bg-white rounded-xl shadow-lg p-8 w-full max-w-3xl">
            <h1 class="text-2xl font-semibold mb-6 text-gray-800">Update Profile</h1>

            <!-- Profile Upload -->
            <div class="flex items-center mb-6">
                <div class="relative">
                    <img :src="profilePreview" alt="Profile"
                        class="w-24 h-24 rounded-full object-cover border-2 border-gray-300" />
                    <input type="file" accept="image/*" @change="onProfileChange"
                        class="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full" />
                </div>
                <button @click="removeProfile" class="ml-4 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600">
                    Remove
                </button>
            </div>

            <!-- Form -->
            <form @submit.prevent="saveChanges" class="grid grid-cols-1 md:grid-cols-2 gap-6">

                <!-- First Name -->
                <div>
                    <label class="block text-gray-700 font-medium mb-1">First Name *</label>
                    <input v-model="form.firstName" type="text" placeholder="First Name"
                        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />
                </div>

                <!-- Last Name -->
                <div>
                    <label class="block text-gray-700 font-medium mb-1">Last Name *</label>
                    <input v-model="form.lastName" type="text" placeholder="Last Name"
                        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required />
                </div>

                <!-- Email -->
                <div>
                    <label class="block text-gray-700 font-medium mb-1">Email</label>
                    <input v-model="form.email" type="email" placeholder="example@gmail.com"
                        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <!-- Mobile Number -->
                <div>
                    <label class="block text-gray-700 font-medium mb-1">Mobile Number *</label>
                    <div class="flex">
                        <span
                            class="inline-flex items-center px-3 rounded-l border border-r-0 border-gray-300 bg-gray-100 text-gray-700">
                            +234
                        </span>
                        <input v-model="form.mobile" type="tel" placeholder="0806 123 7890"
                            class="w-full border border-gray-300 rounded-r px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required />
                    </div>
                </div>

                <!-- Gender -->
                <div>
                    <label class="block text-gray-700 font-medium mb-1">Gender</label>
                    <div class="flex gap-4">
                        <label class="flex items-center gap-2">
                            <input type="radio" value="Male" v-model="form.gender" class="accent-blue-500" />
                            Male
                        </label>
                        <label class="flex items-center gap-2">
                            <input type="radio" value="Female" v-model="form.gender" class="accent-blue-500" />
                            Female
                        </label>
                    </div>
                </div>

                <!-- ID (read-only) -->
                <div>
                    <label class="block text-gray-700 font-medium mb-1">ID</label>
                    <input type="text" v-model="form.id" readonly
                        class="w-full border border-gray-300 rounded px-3 py-2 bg-gray-100 cursor-not-allowed" />
                </div>

                <!-- Tax Identification Number -->
                <div>
                    <label class="block text-gray-700 font-medium mb-1">Tax Identification Number</label>
                    <input v-model="form.taxNumber" type="text" placeholder="TIN"
                        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>

                <!-- Tax Identification Country -->
                <div>
                    <label class="block text-gray-700 font-medium mb-1">Tax Country</label>
                    <select v-model="form.taxCountry"
                        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                        <option value="Nigeria">Nigeria</option>
                        <option value="USA">USA</option>
                        <option value="UK">UK</option>
                    </select>
                </div>

                <!-- Residential Address -->
                <div class="md:col-span-2">
                    <label class="block text-gray-700 font-medium mb-1">Residential Address</label>
                    <textarea v-model="form.address" rows="3" placeholder="Street, City, State"
                        class="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"></textarea>
                </div>

                <!-- Save Button -->
                <div class="md:col-span-2">
                    <button type="submit"
                        class="w-full bg-blue-600 text-white font-semibold py-2 rounded hover:bg-blue-700">
                        Save Changes
                    </button>
                </div>

            </form>
        </div>
    </div>
</template>
