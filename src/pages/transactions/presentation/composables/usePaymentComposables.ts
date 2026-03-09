import type { PaymentEntity } from "@pages/transactions/domain/payments_entities";
import { useAlertStore } from "@stores/ui/alert";
import { ref, computed } from "vue";
import { fetchPayment as fetchPaymentAPI } from "@pages/transactions/data/api/transactios_api";

export function usePayment() {
  const payment = ref<PaymentEntity>()
  const loading = ref<boolean>(false)

  const alert = useAlertStore()

  async function fetchPayment(id: number) {
    try {
      loading.value = true
      const response = await fetchPaymentAPI(id)
      payment.value = response.data
      loading.value = false
    } catch (e) {
      loading.value = false
      alert.show(`Failed to fetch payment id: ${id}`)
    }

  }

  return { payment, loading, alert, fetchPayment }
}

import { usePaymentsStore } from "../store/payment.store"

export function usePaymentsInfiniteScroll() {
  const store = usePaymentsStore()

  const hasMore = computed(() => {
    return store.currentPage <= store.totalPages
  })

  const loadMore = async () => {
    if (!hasMore.value) {
      console.log("No more to load.")
      return
    }
    await store.fetchPayments(true)
  }

  return {
    store,
    loadMore,
    hasMore
  }
}