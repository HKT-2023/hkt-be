import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { Type } from "class-transformer";
import { HttpStatus } from "@nestjs/common";
import { NftMessageError, NftMessageSuccess } from "src/modules/nft/nft.const";

export class ConfigSellDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Id of nft in nft tables",
    required: true,
    example: "63bd19ae801ebab8d9fdfe69",
  })
  nftId: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  @ApiProperty({
    description: "Price want to sell",
    required: true,
    example: 10,
  })
  price: number;
}

export class ConfigSellResponseSuccess {
  @ApiProperty({
    example: NftMessageSuccess.SellingFixedSuccess,
  })
  message: string;

  @ApiProperty({
    example: {
      createdAt: "2023-01-11T07:56:43.870Z",
      updatedAt: "2023-01-11T07:56:43.870Z",
      nftId: "63bd19ae801ebab8d9fdfe69",
      type: "sellFixedPrice",
      price: 10,
      currency: "REAL",
      startTime: "2023-01-11T07:58:27.506Z",
      endTime: "2023-01-11T07:58:27.506Z",
      status: "active",
      _id: "63be6c23da22b1fdd087b992",
      __v: 0,
    },
  })
  data: {};

  @ApiProperty({
    example: HttpStatus.CREATED,
  })
  statusCode: number;
}

export class ConfigSellResponseFailed {
  @ApiProperty({
    example: `${NftMessageError.NftNotFound} | ${NftMessageError.NftSellingConfigExist}`,
  })
  message: string;
}
