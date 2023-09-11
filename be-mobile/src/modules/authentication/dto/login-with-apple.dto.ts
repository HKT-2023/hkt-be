import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";

export class LoginWithAppleDto {
  @ApiProperty({
    description: "Apple token",
    example: "An example apple token",
  })
  @IsNotEmpty()
  token: string;

  @ApiProperty({
    description: "Apple nonce",
    example: "q_u2wGcdMt3eSPCHZDpZX_5Otwa-oVTb",
  })
  @IsNotEmpty()
  nonce: string;
}
