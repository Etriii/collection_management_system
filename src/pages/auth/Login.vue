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
                <Input type="email" label="Username" v-model="loginForm.username" :leftIcon="Mail"
                    placeholder="Enter your username or email" required ref="inputElement" />
                <Input :type="loginForm.passwordIconToggled ? 'text' : 'password'" label="Password"
                    v-model="loginForm.password" :leftIcon="LockKeyhole"
                    :right-icon="loginForm.passwordIconToggled ? Eye : EyeOff"
                    placeholder="Enter your username or email" :onRightIconClick="handlePasswordIconClick" required />

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

                <Button variant="primary" size="md" :loading="loginForm.loading" loadingText="Logging In..."
                    :disabled="loginForm.loading" type="submit"
                    className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
                    Log In
                </Button>
            </form>

            <p class="text-center text-gray-500 py-2">or</p>

            <div id="g_id_onload" data-context="none" data-ux_mode="popup" v-bind:data-client_id="googleClientId">
            </div>

            <div class="g_id_signin flex justify-center" data-type="text" data-shape="rectangular" data-theme="outline"
                data-size="large">
            </div>
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
const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

onMounted(() => {
    if (inputElement.value && inputElement.value.input) {
        inputElement.value.input.focus();
    }

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)

    script.onload = () => {
        const gIdOnLoadElement = document.getElementById("g_id_onload");
        gIdOnLoadElement.setAttribute("data-client_id", googleClientId);
        window.google?.accounts.id.initialize({
            client_id: googleClientId,
            callback: handleCredentialResponse,
        })
    }
});

async function handleCredentialResponse(response) {
    try {
        // console.log('Google response:', response);
        loginForm.value.loading = true;

        if (!response.credential) {
            throw new Error('Invalid token received from Google');
        }

        const res = await fetch(import.meta.env.VITE_API_BASE_URL + "api/v1/auth/google/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token: response.credential }),
        });

        if (!res.ok) {
            throw new Error(`Failed to log in via Google: ${res.statusText}`);
        }

        const jwtData = await res.json();
        // console.log('JWT Data:', jwtData);

        // Local storage lang sa, kapoy pa mag redis or cache
        localStorage.setItem("refresh", jwtData.data.refresh);
        localStorage.setItem("access", jwtData.data.access);

        const userData = await fetch(import.meta.env.VITE_API_BASE_URL + "api/v1/profile/", {
            method: "GET",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${jwtData.data.access}` },
        });

        const yes = await userData.json()

        if (yes.status_code == 200) { 
            localStorage.setItem("userData", JSON.stringify(yes.data))
        }

        // LATER NAKU MAG CREATE OF REUSABLE NGA MGA REQUESTS SA API

        router.push('/');
    } catch (err) {
        console.error('Error:', err);
        alert("Google login failed.");
        loginForm.value.loading = false;
    }
}

const router = useRouter();

const loginForm = ref({
    username: "",
    password: "",
    loading: false,
    passwordIconToggled: false
})

function handlePasswordIconClick() {
    loginForm.value.passwordIconToggled = !loginForm.value.passwordIconToggled;
}

const handleLoginButtonClick = () => {
    loginForm.value.loading = true;

    alert("logged in")

    const timeout = setTimeout(() => {
        loginForm.value.loading = false;
        console.log('Login attempt timed out.');
    }, 10000);

    setTimeout(() => {
        clearTimeout(timeout);
        router.push('/');
        loginForm.value.loading = false;
    }, 1000);

};
</script>