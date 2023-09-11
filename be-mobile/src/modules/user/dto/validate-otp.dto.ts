import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength } from "class-validator";

export class VerifyOTPDto {
  @IsNotEmpty()
  @MaxLength(5)
  @ApiProperty({
    description: "Otp ode",
    required: true,
    example: "88888",
  })
  otpCode: string;
}
