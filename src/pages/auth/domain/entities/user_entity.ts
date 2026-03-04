import type { Institute } from "@core/models";

export interface UserEntity {
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    exp: number | null;
    groups: string[];
    institute: Institute | null;
    profile: string
}
