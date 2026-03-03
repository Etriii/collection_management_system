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

export function useViewModalById() {
    const isFeeModalOpen = ref(false)
    const feeId = ref(0)

    const viewFee = (fee_id: number) => {
        feeId.value = fee_id;
        isFeeModalOpen.value = true
    }

    return { isFeeModalOpen, feeId, viewFee }
}


// i was thinking of having the modals pre loaded in the main page. but for the sake of future devs and making it somewaht readable, okay na guro ni kani? haha.