export enum UserMessageSuccess {
  UpdateUserSuccess = "User information updated successfully.",
  ChangePasswordSuccessfully = "Password changed successfully.",
  GetUserInfoSuccessfully = "User information retrieved successfully.",
  SendEmailSetPasswordSuccessfully = "A password reset token has been sent to your email.",
  SendPhoneCodeSuccessfully = "An SMS has been sent to your phone.",
  AuthHashSuccessfully = "Hash authenticated successfully.",
  ForgotPasswordCodeValid = "The password reset code is valid.",
  ValidatePhoneCodeSuccess = "You have successfully verified your mobile number",
  verifyOtpSuccessfully = "OTP verification successful.",
  HomePageSuccessfully = "Homepage sections retrieved successfully.",
}

export enum UserMessageError {
  WrongPassword = "The current password is invalid",
  WrongLengthPassword = "The password must have at least 8 characters.",
  AtLeastOneUppercase = "The password must contain at least one uppercase letter.",
  AtLeastOneNumber = "The password must contain at least one number.",
  AtLeastOneSpecial = "The password must contain at least one special character.",
  InvalidEmail = "Invalid email. ",
  InvalidPhone = "Invalid phone number.",
  NotVerifyPhone = "The phone number is not verified.",
  InvalidCode = "The code is invalid. Please try again.",
  DeviceLocked = "After 5 failed attempts, your transfer will be locked for 30 minutes.",
  ReEnterPasswordNotMatch = "The new password confirmation doesn't match.",
  AdminCanNotUserThisApi = "Admin cannot use this API.",
  LicenseHasExist = "User update failed: license used.",
  ExistPhone = "This number already exists. Please try again.",
  WrongType = "Incorrect user type.",
}

export enum TypeOfUser {
  Admin = "Admin",
  User = "User",
  NonKlaytnAgent = "NonKlaytnAgent",
  KlaytnAgent = "KlaytnAgent",
  Vendor = "Vendor",
}

export enum SocialMedia {
  Facebook = "facebook",
  Twitter = "twitter",
  Instagram = "instagram",
  LinkedIn = "linkedIn",
  TikTok = "tikTok",
}

export class TypeSocialMedia {
  type: SocialMedia;
  link: string;
}

export const LIMIT = 4;
export const PAGE = 1;
