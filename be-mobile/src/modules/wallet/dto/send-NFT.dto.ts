import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class SendNFTDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: "_id of NFT",
    required: true,
    example: "64071de6c74bc016ae6778f0",
  })
  NFTId: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: "Account id of receiver",
    required: true,
    example: "0.0.3579660",
  })
  receiveAccount: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: "Describe or note",
    required: false,
    example: "I transfer this as a gift",
  })
  memo: string;
}
