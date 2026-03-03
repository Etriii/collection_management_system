import api from "@services/apiService"
import { type ApiResponse, type ListParams, type PaginatedApiResponse } from "@core/types"
// import { type StudentEntity, type StudentFilters, type StudentSummaryFeesResponse } from "@pages/students/domain/entities/StudentEntities"
import { ENDPOINTS } from '@core/url_paths';
import { cleanObject } from "@utils/cleanObject";
import type { FeeDetailedEntity } from "@pages/fees/domain/entities/FeeEntity";


// export async function getFeesApi(params: ListParams<StudentFilters>): Promise<PaginatedApiResponse<StudentEntity>> {
//     const result = await api.get<ApiResponse<PaginatedApiResponse<StudentEntity>>>(
//         ENDPOINTS.students,
//         {
//             ...cleanObject(params),
//             ...cleanObject(params.filters),
//         }
//     )

//     return result.data
// }

export async function getFeeApi(
    id: number
): Promise<ApiResponse<FeeDetailedEntity>> {
    try {
        const result = await api.get<ApiResponse<FeeDetailedEntity>>(
            `${ENDPOINTS.fees}${id}/`
        )
        return result
    } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to load fee")
    }
}

export async function getFeeAttendanceDetailsApi(
    id: number
): Promise<ApiResponse<FeeDetailedEntity>> {
    try {
        const result = await api.get<ApiResponse<FeeDetailedEntity>>(
            `${ENDPOINTS.fees}${id}/attendance-details`
        )
        return result
    } catch (err: any) {
        throw new Error(err.response?.data?.message || "Failed to load fee attendance details")
    }
}