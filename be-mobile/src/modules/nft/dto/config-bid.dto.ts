import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString } from "class-validator";
import { NftMessageError, NftMessageSuccess } from "src/modules/nft/nft.const";
import { HttpStatus } from "@nestjs/common";
import { Type } from "class-transformer";

export class ConfigBidDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Id of nft in nft tables",
    required: true,
    example: "63bd19ae801ebab8d9fdfe69",
  })
  nftId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "End time bid",
    required: true,
    example: new Date(),
  })
  endTime: string;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  @ApiProperty({
    description: "Min bid price",
    required: true,
    example: 100,
  })
  winningPrice: number;

  @IsNumber()
  @Type(() => Number)
  @IsNotEmpty()
  @ApiProperty({
    description: "Winning price",
    required: true,
    example: 1,
  })
  startPrice: number;
}

export class ConfigBidResponseSuccess {
  @ApiProperty({
    example: NftMessageSuccess.BidSuccess,
  })
  message: string;

  @ApiProperty({
    example: {
      createdAt: "2023-01-11T08:05:51.957Z",
      updatedAt: "2023-01-11T08:05:51.957Z",
      nftId: "63bd19ae801ebab8d9fdfe69",
      type: "bid",
      currency: "REAL",
      startTime: "2023-01-11T08:01:35.675Z",
      endTime: "2023-01-11T08:01:35.675Z",
      status: "active",
      _id: "63be6e0583b74596f33d81b5",
      __v: 0,
    },
  })
  data: {};

  @ApiProperty({
    example: HttpStatus.CREATED,
  })
  statusCode: number;
}

export class ConfigBidResponseFailed {
  @ApiProperty({
    example: `${NftMessageError.NftNotFound} | ${NftMessageError.NftSellingConfigExist}`,
  })
  message: string;
}
