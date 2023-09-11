import { ApiProperty } from "@nestjs/swagger";
import { IsOptional } from "class-validator";

export class DetailUserDto {
  @IsOptional()
  @ApiProperty({
    description: "User Id",
    required: false,
    example: "example user id",
  })
  userId: string;
}
