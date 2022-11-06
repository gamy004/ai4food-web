import { Model } from "pinia-orm";
import { Uid, Str, Attr } from "pinia-orm/dist/decorators";

export enum UserRole {
  ADMIN = "admin",
  USER = "user",
}

export enum UserTeam {
  ADMIN = "admin",
  QA = "qa",
  SWAB = "swab",
  LAB = "lab",
  PRODUCTION = "production",
}

export default class User extends Model {
  static entity = "user";

  @Uid()
  declare id: string;

  @Str("")
  declare userName: string;

  @Str("")
  declare email: string;

  @Str("")
  declare firstName: string;

  @Str("")
  declare lastName: string;

  @Str(UserRole.USER)
  declare role: UserRole;

  @Attr(null)
  declare team: UserTeam | null;

  get isInLabTeam(): boolean {
    return this.isTeam("LAB");
  }

  get isInSwabTeam(): boolean {
    return this.isTeam("SWAB");
  }

  get isInProductionTeam(): boolean {
    return this.isTeam("PRODUCTION");
  }

  get isInAdminTeam(): boolean {
    return this.isTeam("ADMIN");
  }

  get displayName(): string {
    const { userName, firstName, lastName } = this;

    return firstName && lastName ? `${firstName} ${lastName}` : userName;
  }

  isTeam(enumKey): boolean {
    return this.team === UserTeam[enumKey];
  }
}
