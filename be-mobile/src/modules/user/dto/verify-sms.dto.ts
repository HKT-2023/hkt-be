import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPhoneNumber, MaxLength } from "class-validator";

export class ValidateSMSDto {
  @IsPhoneNumber()
  @IsNotEmpty()
  @MaxLength(12)
  @ApiProperty({
    description: "Phone",
    required: true,
    example: "0372482268",
  })
  phone: string;

  @IsNotEmpty()
  @ApiProperty({
    description: "Code to reset password that have sent to user email",
    required: true,
    example: "19989",
  })
  code: string;
}
