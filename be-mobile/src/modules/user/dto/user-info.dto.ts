import { ApiProperty } from "@nestjs/swagger";
import { HttpStatus } from "@nestjs/common";
import { UserMessageSuccess } from "src/modules/user/user.const";

export class UserInfoDtoResponseSuccess {
  @ApiProperty({
    example: UserMessageSuccess.GetUserInfoSuccessfully,
  })
  message: string;

  @ApiProperty({
    example: {
      createdAt: "2023-01-11T07:16:39.715Z",
      updatedAt: "2023-01-11T07:16:39.715Z",
      _id: "63b3f329ebb792e62c1b6354",
      avatarUrl: "https//image.org/0123.jpg",
      firstName: "John",
      lastName: "Nguyen",
      typeOfUser: "Admin",
      email: "exampleEmail@gmail.com",
      phone: "01818464638",
      gender: "Male",
      dateOfBirth: "2020-01-11",
      status: "Active",
      __v: 0,
    },
  })
  data: {};

  @ApiProperty({
    example: HttpStatus.OK,
  })
  statusCode: number;
}

export class UserInfoDtoResponseFailed {
  @ApiProperty({
    example: "UNAUTHORIZED",
  })
  message: string;
}
