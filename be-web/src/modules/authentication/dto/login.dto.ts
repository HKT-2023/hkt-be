import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class LoginDto {
  @IsString()
  @ApiProperty({
    description: "Email",
    required: true,
    example: "exampleEmail@gmail.com",
  })
  email: string;

  @IsString()
  @ApiProperty({
    description: "Password",
    required: true,
    example: "examplePassword@123",
  })
  password: string;
}
