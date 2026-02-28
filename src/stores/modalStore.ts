import { defineStore } from "pinia";
import { ref, watch } from "vue";

export const useModalStackStore = defineStore("modalStack", () => {
    const stack = ref<{ id: number; close: () => void }[]>([]);
    let counter = 0;

    // function register(closeFn: () => void) {
    //     counter++;
    //     stack.value.push({ id: counter, close: closeFn });
    //     return 50 + counter;
    // }

    // function unregister(id: number) {
    //     stack.value = stack.value.filter(m => m.id !== id);
    // }
    function register(closeFn: () => void) {
        counter++;
        const id = 50 + counter; 
        stack.value.push({ id: id, close: closeFn });
        return id; 
    }

    function unregister(id: number) {
        stack.value = stack.value.filter(m => m.id !== id);
    }
    function closeTop() {
        const top = stack.value[stack.value.length - 1];
        if (top) {
            top.close();
        }
    }

    watch(stack, (newStack) => {
        document.body.style.overflow =
            newStack.length > 0 ? "hidden" : "";
    }, { deep: true });

    return {
        stack,
        register,
        unregister,
        closeTop
    };
});