import { ApiProperty } from "@nestjs/swagger";
import { Matches, IsOptional, IsString, MaxLength } from "class-validator";
import { UserMessageSuccess } from "src/modules/user/user.const";
import { HttpStatus } from "@nestjs/common";

export class UpdateUserDto {
  @IsOptional()
  @ApiProperty({
    description: "Url of avatar",
    required: false,
    example: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  })
  avatarUrl: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "First name",
    required: false,
    example: "John",
  })
  @MaxLength(255)
  firstName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Last name",
    required: false,
    example: "Nguyen",
  })
  @MaxLength(255)
  lastName: string;

  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/\d{4}$/)
  @IsOptional()
  @ApiProperty({
    description: "Date of birth format MM/DD/YYYY",
    required: false,
    example: "01/29/2023",
  })
  dateOfBirth: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Phone",
    required: false,
    example: "01818464638",
  })
  @MaxLength(15)
  phone: string;
}

export class UpdateUserSuccess {
  @ApiProperty({
    example: UserMessageSuccess.UpdateUserSuccess,
  })
  message: string;

  @ApiProperty({
    example: {
      createdAt: "2023-02-06T08:14:48.135Z",
      updatedAt: "2023-02-06T08:14:48.135Z",
      avatarUrl: "https//image.org/0123.jpg",
      firstName: "John",
      lastName: "Nguyen",
      typeOfUser: "Admin",
      email: "exampleEmail10@gmail.com",
      phone: "01818464638",
      dateOfBirth: "12/28/2023",
      status: "Active",
      _id: "63e0b6fc05100ad27b4953da",
    },
  })
  data: any;

  @ApiProperty({
    example: HttpStatus.OK,
  })
  statusCode: number;
}
