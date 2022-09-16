import { Model, Str, Uid } from "pinia-orm";

export enum UserRole {
    ADMIN = "admin",
    USER = "user",
}

export enum UserTeam {
    ADMIN = "admin",
    QA = "qa",
    SWAB = "swab",
    LAB = "lab",
    PRODUCTION = "production"
}

export default class User extends Model {
  static entity = "user";

    @Uid()
      id!: string | null;

    @Str("")
      userName!: string;

    @Str("")
      email!: string;

    @Str(null, { nullable: true })
      firstName!: string | null;

    @Str(null, { nullable: true })
      lastName!: string | null;

    @Str(UserRole.USER)
      role!: UserRole;

    @Str(null, { nullable: true })
      team!: UserTeam | null;

    get isInLabTeam (): boolean {
      return this.isTeam("LAB");
    }

    get isInSwabTeam (): boolean {
      return this.isTeam("SWAB");
    }

    get displayName (): string {
      const { userName, firstName, lastName } = this;

      return firstName && lastName
        ? `${firstName} ${lastName}`
        : userName;
    }

    isTeam (enumKey): boolean {
      return this.team === UserTeam[enumKey];
    }
}
