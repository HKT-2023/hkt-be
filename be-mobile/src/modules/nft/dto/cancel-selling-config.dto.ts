import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { NftMessageError, NftMessageSuccess } from "src/modules/nft/nft.const";
import { HttpStatus } from "@nestjs/common";

export class CancelSellingConfigDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Id of selling config",
    required: true,
    example: "63bd19ae801ebab8d9fdfe69",
  })
  sellingConfigId: string;
}

export class CancelSellingConfigSuccess {
  @ApiProperty({
    example: NftMessageSuccess.CancelSellingConfigSuccess,
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

export class NoSellingConfigFoundResponse {
  @ApiProperty({
    example: `${NftMessageError.NoSellingConfigFound}`,
  })
  message: string;
}

export class NotOwnerSellingConfigResponse {
  @ApiProperty({
    example: `${NftMessageError.NotOwnerSellingConfig}`,
  })
  message: string;
}
