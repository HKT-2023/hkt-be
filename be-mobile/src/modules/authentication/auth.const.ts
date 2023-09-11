import { SetMetadata } from "@nestjs/common";
import { TypeOfUser } from "src/modules/user/user.const";

export enum AuthMessageSuccess {
  LoginSuccess = "Login successfully.",
}
export enum AuthMessageError {
  AccountInactive = "Your account has been deactivated. Please contact the admin to activate your account.",
  WrongEmailOrPassword = "Your email or password is invalid. Please try again or reset your password.",
  InvalidToken = "Invalid token.",
}

export const Public = () => SetMetadata(process.env.PUBLIC_KEY_JWT, true);
export const Roles = (...roles: TypeOfUser[]) =>
  SetMetadata(process.env.ROLE_KEY_JWT, roles);
