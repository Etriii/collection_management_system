import type { FeeSlimEntity } from "@pages/fees/domain/entities/FeeEntity";

export interface PaymentSubmissionEntity {
    id: number;
    fee: FeeSlimEntity;
    screenshot_urls: string[];
    reviewed_by: string | null;
    amount_paid: string;
    reference_number: string;
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}