import { type FeeSlimEntity } from "@pages/fees/domain/entities/FeeEntity"
export type PaymentMethod = "cash" | "gcash" | "bank"

export interface PaymentEntity {
    id: number
    fee: FeeSlimEntity

    previous_balance:number
    amount_paid: number
    payment_method: PaymentMethod

    received_by: string
    payment_submission: string | null

    created_at: string
    updated_at: string
    updated_by: string | null
}


export type BulkPaymentPayload = {
    fee: number;
    amount_paid: number;
}[];
