import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import {
  UserMessageError,
  UserMessageSuccess,
} from "src/modules/user/user.const";
import { AuthMessageError } from "src/modules/authentication/auth.const";

export class ChangePasswordDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Old password",
    required: true,
    example: "examplePassword@123",
  })
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "New password",
    required: true,
    example: "newExamplePassword@123",
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Re enter new password again",
    required: true,
    example: "newExamplePassword@123",
  })
  confirmPassword: string;
}

export class ChangePasswordSuccess {
  @ApiProperty({
    example: UserMessageSuccess.ChangePasswordSuccessfully,
  })
  message: string;

  @ApiProperty({
    example: true,
  })
  data: boolean;
}

export class ChangePasswordFailed {
  @ApiProperty({
    example: `${UserMessageError.ReEnterPasswordNotMatch} | ${AuthMessageError.WrongEmailOrPassword}`,
  })
  message: string;
}
