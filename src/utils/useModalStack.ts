import { ref } from "vue";

const stackCount = ref(0);

export function useModalStack() {

    function register() {
        stackCount.value++;
        return 50 + stackCount.value;
    }

    function unregister() {
        stackCount.value = Math.max(0, stackCount.value - 1);
    }

    function isTop(zIndex: number) {
        return zIndex === 50 + stackCount.value;
    }

    return {
        register,
        unregister,
        isTop,
        stackCount
    };
}