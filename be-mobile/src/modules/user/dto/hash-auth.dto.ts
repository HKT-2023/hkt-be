import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { UserMessageSuccess } from "src/modules/user/user.const";
import { HttpStatus } from "@nestjs/common";

export class HashAuthDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description: "User id",
    example: "63b3f329ebb792e62c1b6354",
  })
  userId: string;
}

export class HashAuthSuccess {
  @ApiProperty({
    example: UserMessageSuccess.AuthHashSuccessfully,
  })
  message: string;

  @ApiProperty({
    example: {
      hex: "a5ef570918be610a29b34a449bf0b9f3816427b1d69a7bb8285d812d25dd131b",
    },
  })
  data: { hex: string };

  @ApiProperty({
    example: HttpStatus.OK,
  })
  statusCode: number;
}
