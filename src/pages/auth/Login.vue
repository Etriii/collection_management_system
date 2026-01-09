<template>
    <div class="mx-auto w-auto border text-black bg-[#ffffff] border-purple-100 shadow-lg rounded-md p-2">
        <div class="p-4">
            <h1 class="text-center text-md font-semibold text-purple-800">
                Administrator
            </h1>
            <div class="text-center text-sm text-gray-600">
                Welcome back! Please sign-in to continue
            </div>

            <br>

            <form @submit.prevent="handleLoginButtonClick" class="space-y-2">
                <Input type="text" label="Username" v-model="loginForm.username" :leftIcon="CircleUser"
                    :error="loginForm.username_error" placeholder="Enter your username" required ref="inputElement" />

                <Input :type="loginForm.passwordIconToggled ? 'text' : 'password'" label="Password"
                    v-model="loginForm.password" :leftIcon="LockKeyhole"
                    :right-icon="loginForm.passwordIconToggled ? Eye : EyeOff" placeholder="Enter your password"
                    :onRightIconClick="handlePasswordIconClick" required :error="loginForm.password_error" />

                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input id="remember-me" type="checkbox" name="remember"
                            class="h-4 w-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500">
                            <label for="remember-me" class="ml-2 text-sm font-medium text-gray-600">
                                Remember me
                            </label>
                    </div>
                    <RouterLink to="/auth/account-recovery"
                        class="text-sm font-medium text-purple-500 hover:text-purple-800">
                        Forgot password?
                    </RouterLink>
                </div>

                <Button variant="primary" size="md" :loading="loading" loadingText="Logging In..." :disabled="loading"
                    type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    Log In
                </Button>
            </form>

            <p class="text-center text-gray-500 py-2">or</p>

            <div id="g_id_onload"></div>
            <div class="g_id_signin flex justify-center"></div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRouter } from 'vue-router';
import { useAuth } from "@pages/auth/presentation/composables/useAuth";
import { CircleUser, LockKeyhole, EyeOff, Eye } from "lucide-vue-next";

import Input from "@components/forms/Input.vue";
import Button from "@components/button/Button.vue";

const router = useRouter();
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const { login, loading, error } = useAuth(googleClientId);

const inputElement = ref(null);

const loginForm = ref({
    username: "",
    username_error: "",
    password: "",
    password_error: "",
    passwordIconToggled: false
});

onMounted(() => {
    if (inputElement.value && inputElement.value.input) {
        inputElement.value.input.focus();
    }
});

function handlePasswordIconClick() {
    loginForm.value.passwordIconToggled = !loginForm.value.passwordIconToggled;
}

const handleLoginButtonClick = async () => {
    loginForm.value.username_error = "";

    try {
        await login(loginForm.value.username, loginForm.value.password);
        router.push('/');
    } catch (e) {
        loginForm.value.username_error = error.value || "Login failed. Please check your credentials.";
    }
};
</script>