<script setup>

import Input from "@components/forms/Input.vue";
import { ref } from "vue";
import { Mail, LockKeyhole, EyeOff, Eye } from "lucide-vue-next";

const username = ref("");
const password = ref("");

const PasswordIconToggled = ref(false)


function handleClick() {
    PasswordIconToggled.value = !PasswordIconToggled.value;
}

</script>

<template>
    <div class="mx-auto w-auto border text-black bg-[#ffffff] border-purple-100 shadow-lg rounded-md p-2">

        <div class="p-4">
            <h1 class="text-center text-md font-semibold text-purple-800">
                Administrator
            </h1>

            <hr class="border border-violet-300 my-2">
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
                    <a href=""
                        class="text-sm font-medium text-purple-500 hover:text-purple-800">
                        Forgot password?
                    </a>
                </div>

                <button type="submit"
                    class="submitBtn p-2 rounded relative w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition hover:from-purple-700 cursor-pointer hover:to-indigo-700 focus:ring-2  disabled:cursor-not-allowed disabled:opacity-70"
                    id="submitBtn">
                    <span class="buttonText">Sign in</span>
                    <svg class="buttonLoader ml-2 hidden h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg"
                        fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4">
                        </circle>
                        <path class="opacity-75" fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z">
                        </path>
                    </svg>
                </button>
            </div>
        </div>

    </div>
</template>