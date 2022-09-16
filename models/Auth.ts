import User from "./User";

export default class Auth {
  accessToken!: string;

  userId!: string;

  user!: User;

  setAccessToken (value: string): void {
    this.accessToken = value;
  }

  getAccessToken (): string {
    return this.accessToken;
  }

  setUserId (value: string): void {
    this.userId = value;
  }

  getUserId (): string {
    return this.userId;
  }

  setUser (value: User): void {
    this.user = value;
  }

  getUser (): User {
    return this.user;
  }
}
