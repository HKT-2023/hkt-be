import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";
import {
  UserMessageError,
  UserMessageSuccess,
} from "src/modules/user/user.const";
import { HttpStatus } from "@nestjs/common";

export class ResetPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: "User email",
    required: true,
    example: "exampleEmail@gmail.com",
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "New password",
    required: true,
    example: "newPassword@123",
  })
  newPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Confirm password",
    required: true,
    example: "newPassword@123",
  })
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Code that have sent through email",
    required: true,
    example: "CddxZ2",
  })
  code: string;
}

export class ResetPasswordDtoResponseSuccess {
  @ApiProperty({
    example: UserMessageSuccess.ChangePasswordSuccessfully,
  })
  message: string;

  @ApiProperty({
    example: true,
  })
  data: boolean;

  @ApiProperty({
    example: HttpStatus.OK,
  })
  statusCode: number;
}

export class ResetPasswordDtoResponseFailed1 {
  @ApiProperty({
    example: UserMessageError.InvalidEmail,
  })
  message: string;
}

export class ResetPasswordDtoResponseFailed2 {
  @ApiProperty({
    example: `${UserMessageError.ReEnterPasswordNotMatch} | ${UserMessageError.InvalidCode}`,
  })
  message: string;
}
