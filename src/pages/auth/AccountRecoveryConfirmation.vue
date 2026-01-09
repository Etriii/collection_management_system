<template>
    <div class="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 class="text-2xl font-semibold text-purple-700 mb-6">Admin Account Recovery</h2>
        <section v-if="!password.success">
            <p class="text-sm text-gray-500 mb-3">We've sent a verification code to {{ emailStored }}. Please enter it
                here to
                verify. CODE: 123456</p>

            <div v-if="!verification.Successfull" class="text-red-400 mb-3">Expire in: {{ countdown }}</div>

            <form @submit.prevent="handleVerifyCode">

                <Input v-model="verification.CodeInput" id="verificationCode" type="text"
                    :disabled="verification.Successfull" placeholder="Enter Verification Code" label="Verification Code"
                    required :error="verification.Error" />

                <div class="flex justify-between items-center mb-4">
                    <button type="button" class="text-purple-600 hover:text-purple-700 text-sm cursor-pointer"
                        @click="goBack">Back</Button>
                    <Button type="submit"
                        class="bg-purple-600 text-white py-2 px-6 rounded-lg hover:bg-purple-700 text-sm"
                        :loading="verification.loading" loadingText="Verifying"
                        :disabled="(verification.loading || verification.Successfull) || verification.Error != ''">
                        Verify
                    </Button>
                </div>

            </form>

            <form @submit.prevent="handleChangePassword" v-if="verification.Successfull" action="" method="post">
                <Input :type="PasswordIconToggled.new ? 'text' : 'password'" label="New Password" v-model="password.new"
                    :leftIcon="LockKeyhole" :right-icon="PasswordIconToggled.new ? Eye : EyeOff"
                    placeholder="Enter your new Password" :onRightIconClick="() => handleNewEyeClick('new')" required />

                <Input :type="PasswordIconToggled.confirmNew ? 'text' : 'password'" label="Confirm New Password"
                    v-model="password.confirmNew" :leftIcon="LockKeyhole"
                    :right-icon="PasswordIconToggled.confirmNew ? Eye : EyeOff" placeholder="Confirm your new Password"
                    :onRightIconClick="() => handleNewEyeClick('confirmNew')" :error="password.error" required />

                <Button type="submit" :disabled="password.loading || password.error != ''" :loading="password.loading"
                    loadingText="Updating Password"
                    class="bg-purple-600 w-full text-white py-2 px-6 rounded-lg hover:bg-purple-700 text-sm">
                    Update Password
                </Button>
            </form>

        </section>

        <div v-if="password.success">
            <div class=" text-sm font-medium mt-[-20px] mb-2 p-2 text-green-600 bg-green-100">
                Password Changed Successfully!
            </div>
            <Button class="bg-purple-600 w-full text-white py-2 px-6 rounded-lg hover:bg-purple-700 text-sm"
                @click="() => { router.push('/auth/login') }">
                Log In
            </Button>
        </div>

    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useTempStore } from '@/stores/tempStore';
const router = useRouter()

const emailStored = useTempStore().get('email')
const otpExpiry = useTempStore().get('otp-expiry')

import { ref, onMounted } from 'vue';
import Input from '@components/forms/Input.vue';
import Button from '@components/button/Button.vue';

import startCountdown from '@utils/expiryTimestamp'

const verification = ref({
    CodeInput: "",
    Error: "",
    Successfull: false,
    loading: false
});

const password = ref({
    new: "",
    confirmNew: "",
    error: "",
    loading: false,
    success: false
})

const goBack = () => {
    verification.value = {}
    useTempStore().remove('email')
    router.push('/auth/account-recovery')
}

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const handleVerifyCode = async () => {
    verification.value.loading = true;
    verification.value.Error = "";
    // NOTE NGA DELE PANI ANG FINAL. THIS SHOULD BE HANDLED SA API. INLCUDING ANG THROTTLING :>
    await delay(2000);
    if (verification.value.CodeInput === "123456") {
        verification.value.Successfull = true;
        verification.value.Error = "";
    } else {
        verification.value.Error = "Invalid verification code!";
        setTimeout(() => { verification.value.Error = "" }, 3000)
    }
    verification.value.loading = false;
}

const handleChangePassword = async () => {
    password.value.loading = true;
    await delay(2000)
    if (password.value.new != password.value.confirmNew) {
        password.value.error = "Passowrd doesnt match"
        setTimeout(() => { password.value.error = "" }, 3000)
    } else {
        password.value.success = true
    }
    password.value.loading = false;
}

// PASSWORD TOGGLE
import { LockKeyhole, EyeOff, Eye } from "lucide-vue-next";

const PasswordIconToggled = ref({ new: false, confirmNew: false });

function handleNewEyeClick(item) {
    PasswordIconToggled.value[item] = !PasswordIconToggled.value[item];
}

// CD 
const countdown = ref('');

onMounted(() => {
    startCountdown(otpExpiry, countdown);
});
</script>

<style scoped></style>