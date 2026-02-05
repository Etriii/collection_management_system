// api/students_api.ts

import api from "@services/apiService"
import { type ApiResponse, type ListParams, type PaginatedApiResponse } from "@core/types"
import { type PaymentEntity, type PaymentSubmissionEntity, type StudentEntity, type StudentFilters, type StudentSummaryFeesResponse } from "@pages/students/domain/entities/StudentEntities"
import { ENDPOINTS } from '@core/url_paths';
import { cleanObject } from "@utils/cleanObject";
import type { FeeEntity } from "@pages/fees/domain/entities/FeeEntity";
import { type FeeFilter } from "@pages/fees/fee_filter";

export async function getStudentsApi(params: ListParams<StudentFilters>): Promise<PaginatedApiResponse<StudentEntity>> {
    const result = await api.get<ApiResponse<PaginatedApiResponse<StudentEntity>>>(
        ENDPOINTS.students,
        {
            ...cleanObject(params),
            ...cleanObject(params.filters),
        }
    )

    return result.data
}

export async function getStudentApi(
    id: number
): Promise<ApiResponse<StudentEntity>> {
    try {
        const result = await api.get<ApiResponse<StudentEntity>>(
            `${ENDPOINTS.students}${id}/`
        )
        return result
    } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to load student")
    }
}

export async function getStudentSummaryFees(studentId: number): Promise<StudentSummaryFeesResponse> {
    const result = await api.get<ApiResponse<StudentSummaryFeesResponse>>(
        `${ENDPOINTS.students}${studentId}/fees-summary`
    )
    return result.data
}

export async function getStudentFeesApi(studentId: number, params: ListParams<FeeFilter>): Promise<PaginatedApiResponse<FeeEntity>> {
    const result = await api.get<ApiResponse<PaginatedApiResponse<FeeEntity>>>(
        ENDPOINTS.fees,
        {
            student_id: studentId,
            ...params,
            ...params.filters,
        }
    )
    return result.data
}

export async function getStudentPaymentsApi(studentId: number): Promise<PaginatedApiResponse<PaymentEntity>> {
    const result = await api.get<ApiResponse<PaginatedApiResponse<PaymentEntity>>>(
        ENDPOINTS.payments,
        {
            student_id: studentId,
            per_page: 100
        }
    )
    return result.data
}
export async function getStudentSubmissionsApi(studentId: number): Promise<PaginatedApiResponse<PaymentSubmissionEntity>> {
    const result = await api.get<ApiResponse<PaginatedApiResponse<PaymentSubmissionEntity>>>(
        ENDPOINTS.paymentSubmissions,
        {
            student__id: studentId,
            per_page: 100
        }
    )
    return result.data
}

// // src/modules/students/data/api/students.api.ts
// import api from "@services/apiService";
// import { ENDPOINTS } from "@core/url_paths";
// import type { ApiResponse, PaginatedApiResnpose } from "@core/types";

// export interface StudentModel {
//     id: number;
//     student_no: string;
//     first_name: string;
//     last_name: string;
//     program: number;
//     school: number;
// }

// export interface StudentFilters {
//     page?: number;
//     page_size?: number;
//     search?: string;
//     program?: number;
//     school?: number;
// }

// export interface PaginatedStudents {
//     current_page: number;
//     per_page: number;
//     total_pages: number;
//     total_items: number;
//     data: StudentModel[];
// }

// export async function fetchStudentsApi(
//     params: StudentFilters
// ): Promise<PaginatedApiResnpose<PaginatedStudents>> {
//     try {
//         return await api.get<PaginatedApiResnpose<StudentModel>>(
//             ENDPOINTS.students,
//             params
//         );
//     } catch (err: any) {
//         throw new Error(err.response?.data?.detail || "Failed to fetch students");
//     }
// }

// export async function fetchStudentApi(
//     id: number
// ): Promise<ApiResponse<StudentModel>> {
//     try {
//         return await api.get<ApiResponse<Student>>(
//             `${ENDPOINTS.students}${id}/`
//         );
//     } catch (err: any) {
//         throw new Error(err.response?.data?.detail || "Student not found");
//     }
// }

// export async function createStudentApi(
//     payload: Partial<Student>
// ): Promise<ApiResponse<Student>> {
//     try {
//         return await api.post<ApiResponse<Student>>(
//             ENDPOINTS.students,
//             payload
//         );
//     } catch (err: any) {
//         throw new Error(err.response?.data?.detail || "Student creation failed");
//     }
// }

// export async function updateStudentApi(
//     id: number,
//     payload: Partial<Student>
// ): Promise<ApiResponse<Student>> {
//     try {
//         return await api.put<ApiResponse<Student>>(
//             `${ENDPOINTS.students}${id}/`,
//             payload
//         );
//     } catch (err: any) {
//         throw new Error(err.response?.data?.detail || "Student update failed");
//     }
// }

// export async function deleteStudentApi(
//     id: number
// ): Promise<ApiResponse<null>> {
//     try {
//         return await api.delete<ApiResponse<null>>(
//             `${ENDPOINTS.students}${id}/`
//         );
//     } catch (err: any) {
//         throw new Error(err.response?.data?.detail || "Student delete failed");
//     }
// }
