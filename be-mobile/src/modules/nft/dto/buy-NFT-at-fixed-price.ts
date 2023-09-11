import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class BuyNFTAtFixedPrice {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Id NFT selling config table",
    required: true,
    example: "63bd19ae801ebab8d9fdfe69",
  })
  NFTSellingConfig: string;
}
