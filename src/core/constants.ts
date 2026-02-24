export interface Token {
  access: string;
  refresh: string;
}

export interface localStorageKeys {
  accessToken: string;
  refreshToken: string;
}

export const STUDENT_STATUSES = ["enrolled", "graduated","dropped",] as const;
export type StudentStatus = typeof STUDENT_STATUSES[number];


export const Roles = {
    STUDENT: 'student',
    COLLETCION_ADMIN: 'Collection Management System Admins',
} as const