// src/modules/students/data/api/students.api.ts
import api from "@services/apiService";
import { ENDPOINTS } from "@core/constants";
import type { ApiResponse } from "@core/types";

export interface Student {
    id: number;
    student_no: string;
    first_name: string;
    last_name: string;
    program: number;
    school: number;
}

export interface StudentFilters {
    page?: number;
    page_size?: number;
    search?: string;
    program?: number;
    school?: number;
}

export interface PaginatedStudents {
    current_page: number;
    per_page: number;
    total_pages: number;
    total_items: number;
    data: Student[];
}

export async function fetchStudentsApi(
    params: StudentFilters
): Promise<ApiResponse<PaginatedStudents>> {
    try {
        return await api.get<ApiResponse<PaginatedStudents>>(
            ENDPOINTS.students,
            params
        );
    } catch (err: any) {
        throw new Error(err.response?.data?.detail || "Failed to fetch students");
    }
}

export async function fetchStudentApi(
    id: number
): Promise<ApiResponse<Student>> {
    try {
        return await api.get<ApiResponse<Student>>(
            `${ENDPOINTS.students}${id}/`
        );
    } catch (err: any) {
        throw new Error(err.response?.data?.detail || "Student not found");
    }
}

export async function createStudentApi(
    payload: Partial<Student>
): Promise<ApiResponse<Student>> {
    try {
        return await api.post<ApiResponse<Student>>(
            ENDPOINTS.students,
            payload
        );
    } catch (err: any) {
        throw new Error(err.response?.data?.detail || "Student creation failed");
    }
}

export async function updateStudentApi(
    id: number,
    payload: Partial<Student>
): Promise<ApiResponse<Student>> {
    try {
        return await api.put<ApiResponse<Student>>(
            `${ENDPOINTS.students}${id}/`,
            payload
        );
    } catch (err: any) {
        throw new Error(err.response?.data?.detail || "Student update failed");
    }
}

export async function deleteStudentApi(
    id: number
): Promise<ApiResponse<null>> {
    try {
        return await api.delete<ApiResponse<null>>(
            `${ENDPOINTS.students}${id}/`
        );
    } catch (err: any) {
        throw new Error(err.response?.data?.detail || "Student delete failed");
    }
}
