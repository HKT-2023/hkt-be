import { ApiProperty } from "@nestjs/swagger";
import { IsOptional, IsString, MaxLength } from "class-validator";

export class UserHomePageDto {
  page?: number;
  limit?: number;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Search name",
    required: false,
    example: "John",
  })
  @MaxLength(255)
  search: string;

  @IsOptional()
  fields?: string;

  userType?: string;
}
