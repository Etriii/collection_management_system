
export interface UserEntity {
    id: number;
    name: string;
    email: string;
}

export interface UserProfileEntity {
    id: number | null;
    username: string;
    email: string;
    exp: number | null;
    groups: string[];
    institute: { id: number; name: string } | null;
    school: { id: number; name: string } | null;
    systems: string[];
}
