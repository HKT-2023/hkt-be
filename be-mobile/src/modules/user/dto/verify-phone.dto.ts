import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, MaxLength } from "class-validator";

export class VerifyPhoneDto {
  @IsNotEmpty()
  @MaxLength(12)
  @ApiProperty({
    description: "Phone",
    required: true,
    example: "0372482268",
  })
  phone: string;
}
