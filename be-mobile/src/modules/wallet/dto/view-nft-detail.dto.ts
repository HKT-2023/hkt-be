import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class ViewNftDetailDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: "_id of NFT return in view NFT in wallet",
    required: true,
    example: "63f46f4181e02299141f7bbf",
  })
  NFTId: string;
}
