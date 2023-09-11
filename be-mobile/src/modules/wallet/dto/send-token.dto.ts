import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Type } from "class-transformer";

export class SendTokenDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: "Receiver account id",
    required: true,
    example: "0.0.3397443",
  })
  accountId: string;

  @IsNotEmpty()
  @Type(() => Number)
  @IsNumber()
  @ApiProperty({
    description: "Amount want to transfer",
    required: true,
    example: 10,
  })
  amount: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Describe or note",
    required: false,
    example: "I transfer this as a gift",
  })
  memo: string;
}
