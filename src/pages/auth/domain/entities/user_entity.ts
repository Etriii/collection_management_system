import type { InstituteModel } from "@pages/auth/data/model/userProfileModel";

export interface UserEntity {
    id: number | null;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    exp: number | null;
    groups: string[];
    institute: InstituteModel | null;
    systems: string[];
}
