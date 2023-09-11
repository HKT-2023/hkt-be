import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty } from "class-validator";
import {
  UserMessageError,
  UserMessageSuccess,
} from "src/modules/user/user.const";
import { HttpStatus } from "@nestjs/common";

export class ForgotPasswordDto {
  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: "Email",
    required: true,
    example: "examplePassword@123",
  })
  email: string;
}

export class ForgotPasswordDtoResponseSuccess {
  @ApiProperty({
    example: UserMessageSuccess.SendEmailSetPasswordSuccessfully,
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

export class ForgotPasswordDtoResponseFailed {
  @ApiProperty({
    example: UserMessageError.InvalidEmail,
  })
  message: string;
}
