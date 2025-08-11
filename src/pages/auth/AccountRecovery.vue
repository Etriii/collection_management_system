<template>
  <div class="bg-white p-6 rounded-lg shadow-lg w-96">
    <h2 class="text-lg font-bold text-purple-600 mb-2">Administrator</h2>
    <p class="text-gray-700 mb-4">To recover your admin account, enter the registered email to receive a recovery
      code.</p>

    <div class="mb-3">
      <Input type="email" label="Email" v-model="email" :leftIcon="Mail" placeholder="Enter your valid email address" />
    </div>
    <div class="flex justify-end space-x-2">
      <Button variant="cancel" size="md" @click="cancel">
        Cancel
      </Button>
      <Button variant="cancel" size="md" @click="confirm" :loading="isLoading" :disabled="isLoading"
        loadingText="Confirming email"
        className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white transition hover:from-purple-700 hover:to-indigo-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
        Confirm
      </Button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import Input from '@components/forms/Input.vue';
import Button from '@components/button/Button.vue';
import { Mail } from 'lucide-vue-next';
import { useRouter } from 'vue-router';

const email = ref('');

const cancel = () => {
  email.value = '';
  emit('close');
};

const router = useRouter();

const isLoading = ref(false);
const isDisabled = ref(false);

const confirm = () => {
  isLoading.value = true;

  const timeout = setTimeout(() => {
    isLoading.value = false;
    console.log('Login attempt timed out.');
  }, 10000);

  setTimeout(() => {
    console.log("Recovery email sent to:", email.value);

    clearTimeout(timeout);
    router.push('/account-recovery/confirmation');
    isLoading.value = false;

  }, 2000);
};

defineProps({
  // Define props if any passed from the parent
});

const emit = defineEmits(); 
</script>

<style scoped></style>
