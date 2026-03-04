import { ref } from 'vue'

export function useViewFee() {
    // const viewFeeModal = ref<{ isOpen: boolean, feeId: number }>({ isOpen: true, feeId: 0 })
    const isFeeModalOpen = ref(false)
    const feeId = ref(0)

    const viewFee = (fee_id: number) => {
        feeId.value = fee_id;
        isFeeModalOpen.value = true
    }

    return { isFeeModalOpen, feeId, viewFee }
}

