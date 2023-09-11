export enum UserMessageSuccess {
  ForgotPasswordCodeValid = "The forgot password code is valid.",
  SendEmailSetPasswordSuccessfully = "We have sent token reset password to your email.",
  UserCreated = "User created successfully.",
  UpdateUserSuccess = "The account updated successfully.",
  ListUserSuccessfully = "List user successfully.",
  ChangePasswordSuccessfully = "Change password successfully.",
  ResetPasswordSuccessfully = "Reset password successfully. We have sent your new password to user email",
  GetUserInfoSuccessfully = "Get user information successfully.",
}

export enum UserMessageError {
  AtLeastOneNumber = "The password field must have at least one number.",
  WrongLengthPassword = "The password field must have at least 8 characters.",
  AtLeastOneUppercase = "The password field must have at least one uppercase.",
  AtLeastOneSpecial = "The password field must have at least one special character.",
  InvalidCode = "The code is invalid. Please try again.",
  InvalidEmail = "The email is invalid.",
  UserHasExist = "Create user failed, exist user created.",
  LicenseHasExist = "Create user failed, license used.",
  ReEnterPasswordNotMatch = "The confirm new password does not match.",
  NotFoundAgent = "Agent Not Found.",
  NotFoundBuyer = "Buyer Not Found.",
  NotFoundSeller = "Seller Not Found.",
  NotFoundReferral = "Referral Not Found.",
  UserNotFound = "User not found.",
  DuplicateListAgentMlsId = "ListAgentMlsId duplicate",
  CommissionInvalid = "Commission must be less than 100 and greater than 0",
}

export enum TypeOfUser {
  Admin = "Admin",
  User = "User",
  NonKlaytnAgent = "NonKlaytnAgent",
  KlaytnAgent = "KlaytnAgent",
  Vendor = "Vendor",
}
