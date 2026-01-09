// data/models/UserProfileModel.ts
import { type UserEntity } from "../../domain/entities/user_entity";

export interface SchoolModel {
  id: number | null;
  school_name: string;
  short_name: string | null;
  logo: string | null;
  location: string;
  created_at: string;
  updated_at: string;
  updated_by: number | null;
}

export interface InstituteModel {
  id: number | null;
  institute_name: string;
  logo: string | null;
  created_at: string;
  updated_at: string;
  updated_by: number | null;
  school: SchoolModel;
}

export class UserModel implements UserEntity {
  public id: number | null;
  public username: string;
  public first_name: string;
  public last_name: string;
  public email: string;
  public exp: number | null;
  public groups: string[];
  public institute: InstituteModel | null;
  public systems: string[];

  constructor(
    id: number | null,
    username: string,
    first_name: string,
    last_name: string,
    email: string,
    exp: number | null,
    groups: string[],
    institute: InstituteModel | null,
    systems: string[]
  ) {
    this.id = id;
    this.username = username;
    this.first_name = first_name;
    this.last_name = last_name;
    this.email = email;
    this.exp = exp;
    this.groups = groups;
    this.institute = institute;
    this.systems = systems;
  }

  static fromJson(json: any): UserModel {
    const institute: InstituteModel | null = json.institute
      ? {
        id: json.institute.id,
        institute_name: json.institute.institute_name,
        logo: json.institute.logo,
        created_at: json.institute.created_at,
        updated_at: json.institute.updated_at,
        updated_by: json.institute.updated_by,
        school: {
          id: json.institute.school.id,
          school_name: json.institute.school.school_name,
          short_name: json.institute.school.short_name,
          logo: json.institute.school.logo,
          location: json.institute.school.location,
          created_at: json.institute.school.created_at,
          updated_at: json.institute.school.updated_at,
          updated_by: json.institute.school.updated_by,
        },
      }
      : null;

    return new UserModel(
      json.id,
      json.username,
      json.first_name ?? "",
      json.last_name ?? "",
      json.email,
      json.exp ?? null,
      json.groups ?? [],
      institute,
      json.systems ?? []
    );
  }

  toJson(): any {
    return {
      id: this.id,
      username: this.username,
      first_name: this.first_name,
      last_name: this.last_name,
      email: this.email,
      exp: this.exp,
      groups: this.groups,
      institute: this.institute,
      systems: this.systems,
    };
  }

  toEntity(): UserEntity {
    return { ...this };
  }

  static fromEntity(entity: UserEntity): UserModel {
    return new UserModel(
      entity.id,
      entity.username,
      entity.first_name,
      entity.last_name,
      entity.email,
      entity.exp,
      entity.groups,
      entity.institute,
      entity.systems
    );
  }
}
