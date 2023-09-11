import { SetMetadata } from "@nestjs/common";
import { TypeOfUser } from "src/modules/user/user.const";

export enum AuthMessageSuccess {
  LoginSuccess = "Login successfully.",
}
export enum AuthMessageError {
  WrongPassword = "The current password is invalid.",
  WrongEmailOrPassword = "Your Email or Password is invalid. Please try again or reset your password.",
  AccountInactive = "Your account has been inactivated. Please contact admin to activate your account.",
}

export const Public = () => SetMetadata(process.env.PUBLIC_KEY_JWT, true);
export const Roles = (...roles: TypeOfUser[]) =>
  SetMetadata(process.env.ROLE_KEY_JWT, roles);
