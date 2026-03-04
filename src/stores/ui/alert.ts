import { defineStore } from 'pinia'

export type AlertType = 'success' | 'error' | 'warning' | 'info'

export interface Alert {
    id: number
    type: AlertType
    message: string
    timeout?: number
}

export const useAlertStore = defineStore('alert', {
    state: () => ({
        alerts: [] as Alert[],
        nextId: 1
    }),

    actions: {
        show(
            message: string,
            type: AlertType = 'info',
            timeout: number = 5000
        ) {
            const id = this.nextId++

            this.alerts.push({ id, message, type, timeout })

            if (timeout) {
                setTimeout(() => {
                    this.remove(id)
                }, timeout)
            }
        },

        remove(id: number) {
            this.alerts = this.alerts.filter(alert => alert.id !== id)
        },

        clear() {
            this.alerts = []
        }
    }
})
