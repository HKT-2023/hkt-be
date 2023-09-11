import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import {
  UserMessageError,
  UserMessageSuccess,
} from "src/modules/user/user.const";
import { HttpStatus } from "@nestjs/common";

export class ValidateCodeDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: "Email",
    required: true,
    example: "examplePassword@123",
  })
  email: string;

  @IsNotEmpty()
  @ApiProperty({
    description: "Code to reset password that have sent to user email",
    required: true,
    example: "19989",
  })
  code: string;
}

export class ValidateCodeSuccess {
  @ApiProperty({
    example: UserMessageSuccess.ForgotPasswordCodeValid,
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

export class ValidateCodeInvalid {
  @ApiProperty({
    example: UserMessageError.InvalidCode,
  })
  message: string;
}
