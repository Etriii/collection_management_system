<template>
    <div class="mx-auto w-auto border text-black bg-[#ffffff] border-purple-100 shadow-lg rounded-md p-2">

        <div class="p-4">
            <h1 class="text-center text-md font-semibold text-purple-800">
                Administrator
            </h1>
            <div class="text-center  text-sm text-gray-600">
                Welcome back! Please sign-in to continue
            </div>

            <br>

            <form @submit.prevent="handleLoginButtonClick" class="space-y-2">
                <Input type="email" label="Username" v-model="loginForm.username" :leftIcon="Mail"
                    placeholder="Enter your username or email" required ref="inputElement" />
                <Input :type="loginForm.passwordIconToggled ? 'text' : 'password'" label="Password"
                    v-model="loginForm.password" :leftIcon="LockKeyhole"
                    :right-icon="loginForm.passwordIconToggled ? Eye : EyeOff"
                    placeholder="Enter your username or email" :onRightIconClick="handlePassowrdIconClick" required />

                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input id="remember-me" type="checkbox" name="remember"
                            class="h-4 w-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500">
                        <label for="remember-me" class="ml-2 text-sm font-medium text-gray-600">
                            Remember me
                        </label>
                    </div>
                    <RouterLink to="/account-recovery"
                        class="text-sm font-medium text-purple-500 hover:text-purple-800">
                        Forgot password?
                    </RouterLink>
                </div>

                <Button variant="primary" size="md" :loading="loginForm.loading" loadingText="Loggin In..."
                    :disabled="loginForm.loading" type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    Log In
                </Button>

            </form>
        </div>

    </div>
</template>

<script setup>
import Input from "@components/forms/Input.vue";
import { ref, onMounted } from "vue";

import { useRouter } from 'vue-router';

import { Mail, LockKeyhole, EyeOff, Eye } from "lucide-vue-next";

import Button from "@components/button/Button.vue";

const inputElement = ref("")

onMounted(() => {
    if (inputElement.value && inputElement.value.input) {
        inputElement.value.input.focus();
    }
});


const router = useRouter();

const loginForm = ref({
    username: "",
    password: "",
    loading: false,
    disabled: false,
    passwordIconToggled: false
})

function handlePassowrdIconClick() {
    loginForm.value.passwordIconToggled = !loginForm.value.passwordIconToggled;
}

const handleLoginButtonClick = () => {
    loginForm.value.loading = true;

    const timeout = setTimeout(() => {
        loginForm.value.loading = false;
        console.log('Login attempt timed out.');
    }, 10000);

    setTimeout(() => {
        clearTimeout(timeout);
        router.push('/');
        loginForm.value.loading = false;

    }, 2000);
};


</script>

<style scoped></style>