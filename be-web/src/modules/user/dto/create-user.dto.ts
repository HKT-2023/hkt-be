import { ApiProperty, OmitType } from "@nestjs/swagger";
import {
  Matches,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { UserStatus, UserTag } from "src/models/schemas/user.schema";
import {
  UserMessageError,
  UserMessageSuccess,
  TypeOfUser,
} from "src/modules/user/user.const";
import { HttpStatus } from "@nestjs/common";

export enum TypeOfUserAllow {
  User = TypeOfUser.User,
  Admin = TypeOfUser.Admin,
}

export class CreateUserDto {
  @IsOptional()
  @IsEnum(UserTag)
  @ApiProperty({
    description: "User tag buyer or seller or both",
    required: false,
    example: `${UserTag.Buyer} | ${UserTag.Seller} |  ${UserTag.BuyerAndSeller}`,
  })
  userTag: UserTag;

  @IsOptional()
  @ApiProperty({
    description: "Url of avatar",
    required: false,
    example: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
  })
  avatarUrl: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "First name",
    required: true,
    example: "John",
  })
  @MaxLength(255)
  firstName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Last name",
    required: true,
    example: "Nguyen",
  })
  @MaxLength(255)
  lastName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "BusinessName Name",
    required: false,
    example: "VinaHey",
  })
  @MaxLength(255)
  businessName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "ListAgentMlsId to matching bridge and local agent",
    required: false,
    example: "CLW-44069",
  })
  @MaxLength(255)
  listAgentMlsId: string;

  @IsString()
  @Matches(/^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/\d{4}$/)
  @IsOptional()
  @ApiProperty({
    description: "Date of birth format MM/DD/YYYY",
    required: false,
    example: "01/29/2023",
  })
  dateOfBirth: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: "Email",
    required: true,
    example: "exampleEmail@gmail.com",
  })
  email: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Phone",
    required: true,
    example: "01818464638",
  })
  @MaxLength(15)
  phone: string;

  @IsEnum(TypeOfUserAllow)
  @ApiProperty({
    description:
      "Type of user want to create. Support only normal user and admin in this API",
    required: true,
    example: `${TypeOfUser.User} | ${TypeOfUser.Admin}`,
  })
  typeOfUser: TypeOfUser;

  @IsEnum(UserStatus)
  @ApiProperty({
    description: "User status",
    required: true,
    example: `${UserStatus.Active} | ${UserStatus.InActive}`,
  })
  status: UserStatus;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Password",
    required: true,
    example: "examplePassword@123",
  })
  password: string;
}

export class UpdateUserDto extends OmitType(CreateUserDto, [
  "password",
  "typeOfUser",
  "email",
]) {
  @IsNotEmpty()
  @ApiProperty({
    description:
      "This is optional, input for update user, ignore for create new user",
    required: true,
    example: "63db39efddfac2cd45c94504",
  })
  userId: string;
}

export class DeleteUserDto {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({
    description:
      "This is optional, input for update user, ignore for create new user",
    required: true,
    example: "63db39efddfac2cd45c94504",
  })
  userId: string;
}

export class CreateUserSuccess {
  @ApiProperty({
    example: UserMessageSuccess.UserCreated,
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
    example: HttpStatus.CREATED,
  })
  statusCode: number;
}

export class UserHasExistResponse {
  @ApiProperty({
    example: UserMessageError.UserHasExist,
  })
  message: string;
}
