// api/students_api.ts

import api from "@services/apiService"
import { type ApiResponse, type PaginatedApiResnpose } from "@core/types"
import { type FeeEntity, type PaymentEntity, type PaymentSubmissionEntity, type StudentEntity, type StudentFilters } from "@pages/students/domain/entities/StudentEntities"
import { ENDPOINTS } from '@core/url_paths';

export async function getStudentsApi(params: {
    page: number
    per_page: number
    search?: string
    ordering?: string
    filters?: StudentFilters
}): Promise<PaginatedApiResnpose<StudentEntity>> {
    const result = await api.get<ApiResponse<PaginatedApiResnpose<StudentEntity>>>(
        ENDPOINTS.students,
        {
            params: {
                page: params.page,
                per_page: params.per_page,
                search: params.search,
                ordering: params.ordering,
                ...params.filters,
            },
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
export async function getStudentFeesApi(studentId: number): Promise<PaginatedApiResnpose<FeeEntity>> {
    const result = await api.get<ApiResponse<PaginatedApiResnpose<FeeEntity>>>(
        ENDPOINTS.fees,
        {
            student_id: studentId,
            per_page: 100
        }
    )

    return result.data
}

export async function getStudentPaymentsApi(studentId: number): Promise<PaginatedApiResnpose<PaymentEntity>> {
    const result = await api.get<ApiResponse<PaginatedApiResnpose<PaymentEntity>>>(
        ENDPOINTS.payments,
        {
            student_id: studentId,
            per_page: 100
        }
    )

    return result.data
}
export async function getStudentSubmissionsApi(studentId: number): Promise<PaginatedApiResnpose<PaymentSubmissionEntity>> {
    const result = await api.get<ApiResponse<PaginatedApiResnpose<PaymentSubmissionEntity>>>(
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
