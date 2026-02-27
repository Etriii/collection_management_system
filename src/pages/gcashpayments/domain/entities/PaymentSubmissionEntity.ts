import type { FeeSlimEntity } from "@pages/fees/domain/entities/FeeEntity";
import type { StudentMiniEntity } from "@pages/students/domain/entities/StudentEntities";

export interface PaymentSubmissionEntity {
    id: number;
    student: StudentMiniEntity,
    fee: FeeSlimEntity;
    screenshot_urls: string[];
    reviewed_by: string | null;
    total_amount_paid: number;
    reference_number: string;
    fee_payment_count: number,
    status: 'pending' | 'approved' | 'rejected';
    created_at: string;
}