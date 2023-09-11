import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginWithGoogleDto {
  @ApiProperty({
    description: "Google token",
    example: "An example google token",
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: "Google client id",
    example: "An example google client id",
  })
  @IsNotEmpty()
  clientId: string;
}
