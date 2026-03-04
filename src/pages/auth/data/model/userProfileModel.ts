// data/models/UserProfileModel.ts
import type { Institute } from "@core/models";
import { type UserEntity } from "../../domain/entities/user_entity";

export class UserModel implements UserEntity {
  public username: string;
  public first_name: string;
  public last_name: string;
  public email: string;
  public exp: number | null;
  public groups: string[];
  public institute: Institute | null;
  public profile: string;

  constructor(
    username: string,
    first_name: string,
    last_name: string,
    email: string,
    exp: number | null,
    groups: string[],
    institute: Institute | null,
    profile: string,
  ) {
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.exp = exp;
    this.groups = groups;
    this.institute = institute;
    this.profile = profile
  }

  static fromJson(json: any): UserModel {
    const institute: Institute | null = json.institute
      ? {
        id: json.institute.id,
        institute_name: json.institute.institute_name,
        logo: json.institute.logo,
        created_at: json.institute.created_at,
        updated_at: json.institute.updated_at,
        school: {
          id: json.institute.school.id,
          school_name: json.institute.school.school_name,
          short_name: json.institute.school.short_name,
          logo: json.institute.school.logo,
          location: json.institute.school.location,
          created_at: json.institute.school.created_at,
          updated_at: json.institute.school.updated_at,
        },
      }
      : null;

    return new UserModel(
      json.username,
      json.first_name ?? "",
      json.last_name ?? "",
      json.email,
      json.exp ?? null,
      json.groups ?? [],
      institute,
      json.profile,
    );
  }

  toJson(): any {
    return {
      username: this.username,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      exp: this.exp,
      groups: this.groups,
      institute: this.institute?.id,
      profile: this.profile,
    };
  }

  toEntity(): UserEntity {
    return { ...this };
  }

  static fromEntity(entity: UserEntity): UserModel {
    return new UserModel(
      entity.username,
      entity.first_name,
      entity.last_name,
      entity.email,
      entity.exp,
      entity.groups,
      entity.institute,
      entity.profile
    );
  }
}
