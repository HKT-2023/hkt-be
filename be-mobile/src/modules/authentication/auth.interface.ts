import { UserSource } from "src/models/schemas/user.schema";

export interface ILoginResponse {
  userId: string;
  role: string;
  accessToken: string;
  source: UserSource;
}
