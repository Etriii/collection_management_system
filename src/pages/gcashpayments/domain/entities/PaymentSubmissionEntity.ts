// import type { FeeSlimEntity } from "@pages/fees/domain/entities/FeeEntity";
import type { FeeReadItems } from "@pages/fees/domain/entities/FeeEntity";
import type { StudentMiniEntity } from "@pages/students/domain/entities/StudentEntities";

export type PaymentSubmissionStatus = 'pending' | 'approved' | 'rejected';

export interface PaymentSubmissionEntity {
    id: number;
    student: StudentMiniEntity;
    // fee: FeeSlimEntity;
    screenshot_urls: string[];
    reviewed_by: string | null;
    total_amount_paid: number;
    reference_number: string;
    fee_payment_count: number;
    status: PaymentSubmissionStatus;
    created_at: string;
}

export interface PaymentSubmissionFeeItem {
  id: number;
  fee: FeeReadItems;
  previous_balance:number,
  amount_paid: number; 
}


export interface DetailedPaymentSubmissionEntity {
  id: number;

  student: StudentMiniEntity;

  screenshot_urls: string[]; 

  fee_items: PaymentSubmissionFeeItem[];

  total_amount_paid: string;
  reference_number: string;

  status: PaymentSubmissionStatus;

  reviewed_by: string | null;
  reviewed_at: string | null;

  remarks: string | null;

  created_at: string;
  updated_at: string;

  updated_by: string | null;
}