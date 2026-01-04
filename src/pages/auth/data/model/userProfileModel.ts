// data/models/UserProfileModel.ts
import { type UserProfileEntity } from "../../domain/entities/user_entity";

export class UserProfileModel implements UserProfileEntity {
  public id: number | null;
  public username: string;
  public email: string;
  public exp: number | null;
  public groups: string[];
  public institute: { id: number; name: string } | null;
  public school: { id: number; name: string } | null;
  public systems: string[];

  constructor(
    id: number | null,
    username: string,
    email: string,
    exp: number | null,
    groups: string[],
    institute: { id: number; name: string } | null,
    school: { id: number; name: string } | null,
    systems: string[]
  ) {
    this.id = id;
    this.username = username;
    this.email = email;
    this.exp = exp;
    this.groups = groups;
    this.institute = institute;
    this.school = school;
    this.systems = systems;
  }

  static fromJson(json: any): UserProfileModel {
    return new UserProfileModel(
      json.id,
      json.username,
      json.email,
      json.exp ?? null,
      json.groups ?? [],
      json.institute ?? null,
      json.school ?? null,
      json.systems ?? []
    );
  }

  toJson(): any {
    return {
      id: this.id,
      username: this.username,
      email: this.email,
      exp: this.exp,
      groups: this.groups,
      institute: this.institute,
      school: this.school,
      systems: this.systems,
    };
  }

  toEntity(): UserProfileEntity {
    return { ...this };
  }

  static fromEntity(entity: UserProfileEntity): UserProfileModel {
    return new UserProfileModel(
      entity.id,
      entity.username,
      entity.email,
      entity.exp,
      entity.groups,
      entity.institute,
      entity.school,
      entity.systems
    );
  }
}
