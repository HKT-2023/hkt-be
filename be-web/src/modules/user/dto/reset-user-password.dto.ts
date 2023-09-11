import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import {
  UserMessageError,
  UserMessageSuccess,
} from "src/modules/user/user.const";
import { AuthMessageError } from "src/modules/authentication/auth.const";

export class ResetUserPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: "User id",
    required: true,
    example: "exampleEmail@gmail.com",
  })
  userEmail: string;
}

export class ResetUserPasswordSuccess {
  @ApiProperty({
    example: UserMessageSuccess.ResetPasswordSuccessfully,
  })
  message: string;

  @ApiProperty({
    example: true,
  })
  data: boolean;
}

export class ChangeUserPasswordFailed {
  @ApiProperty({
    example: `${UserMessageError.ReEnterPasswordNotMatch} | ${AuthMessageError.WrongEmailOrPassword}`,
  })
  message: string;
}
