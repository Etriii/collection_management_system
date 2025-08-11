<script setup>

import Input from "@components/forms/Input.vue";
import { ref } from "vue";

import { useRouter } from 'vue-router';

import { Mail, LockKeyhole, EyeOff, Eye } from "lucide-vue-next";

import Button from "@components/button/Button.vue";


const username = ref("");
const password = ref("");


const PasswordIconToggled = ref(false)


function handleClick() {
    PasswordIconToggled.value = !PasswordIconToggled.value;
}

const router = useRouter();

const isLoading = ref(false);
const isDisabled = ref(false);

const handleLoginButtonClick = () => {
    isLoading.value = true;

    const timeout = setTimeout(() => {
        isLoading.value = false;
        console.log('Login attempt timed out.');
    }, 10000);

    setTimeout(() => {
        clearTimeout(timeout); 
        router.push('/'); 
        isLoading.value = false;

        
    }, 2000); 
};

const handleDelete = () => {
    alert("Delete action triggered!");
};

</script>

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

            <div class="space-y-2">
                <Input type="email" label="Username" v-model="username" :leftIcon="Mail"
                    placeholder="Enter your username or email" />
                <Input :type="PasswordIconToggled ? 'text' : 'password'" label="Password" v-model="password"
                    :leftIcon="LockKeyhole" :right-icon="PasswordIconToggled ? Eye : EyeOff"
                    placeholder="Enter your username or email" :onRightIconClick="handleClick" />

                <div class="flex items-center justify-between">
                    <div class="flex items-center">
                        <input id="remember-me" type="checkbox" name="remember"
                            class="h-4 w-4 rounded border-gray-300 text-purple-500 focus:ring-purple-500">
                        <label for="remember-me" class="ml-2 text-sm font-medium text-gray-600">
                            Remember me
                        </label>
                    </div>
                    <RouterLink to="/account-recovery" class="text-sm font-medium text-purple-500 hover:text-purple-800">
                        Forgot password?
                    </RouterLink>
                </div>

                <Button variant="primary" size="md" @click="handleLoginButtonClick" :loading="isLoading"
                    loadingText="Loggin In..." :disabled="isLoading"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    Log In
                </Button>

            </div>
        </div>

    </div>
</template>


<style scoped></style>