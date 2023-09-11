import { ApiProperty } from "@nestjs/swagger";
import {
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from "class-validator";
import { UserStatus, UserTag } from "src/models/schemas/user.schema";
import { Type } from "class-transformer";
import { UserMessageSuccess, TypeOfUser } from "src/modules/user/user.const";
import { HttpStatus } from "@nestjs/common";

export class ListUserDtoSort {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "First name",
    required: false,
    example: "-1 for DESC | 1 for ASC",
  })
  firstName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Last name",
    required: false,
    example: "-1 for DESC | 1 for ASC",
  })
  lastName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Email",
    required: false,
    example: "-1 for DESC | 1 for ASC",
  })
  sortEmail: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Phone",
    required: false,
    example: "-1 for DESC | 1 for ASC",
  })
  sortPhone: string;

  @IsOptional()
  @ApiProperty({
    description: "Type of user",
    required: false,
    example: "-1 for DESC | 1 for ASC",
  })
  sortTypeOfUser: string;

  @IsOptional()
  @ApiProperty({
    description: "User status",
    required: false,
    example: "-1 for DESC",
  })
  sortStatus: string;

  @IsOptional()
  @ApiProperty({
    description: "User created at",
    required: false,
    example: "-1 for DESC",
  })
  sortCreatedAt: string;
}

export class ListUserDto {
  @IsOptional()
  @ApiProperty({
    description: "User tag buyer or seller or both",
    required: false,
    example: `${UserTag.Buyer},${UserTag.Seller},${UserTag.BuyerAndSeller}`,
  })
  userTags: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Name",
    required: false,
    example: "John",
  })
  @MaxLength(255)
  name: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Email",
    required: false,
    example: "inh@gmai",
  })
  @MaxLength(255)
  email: string;

  @IsEnum(TypeOfUser)
  @IsOptional()
  @ApiProperty({
    description: "Type of user",
    required: false,
    example: `${TypeOfUser.Admin} | ${TypeOfUser.User} | ${TypeOfUser.KlaytnAgent} | ${TypeOfUser.NonKlaytnAgent} | ${TypeOfUser.Vendor}`,
  })
  typeOfUser: TypeOfUser;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "License number",
    required: false,
    example: "exampleEmail@gmail.com",
  })
  @MaxLength(255)
  licenseNumber: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Vendor location",
    required: false,
    example: "Vietnam",
  })
  @MaxLength(255)
  vendorLocation: string;

  @IsEnum(UserStatus)
  @IsOptional()
  @ApiProperty({
    description: "User status",
    required: false,
    example: `${UserStatus.Active} | ${UserStatus.InActive}`,
  })
  @MaxLength(255)
  status: UserStatus;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Vendor type",
    required: false,
    example: `63eb4f1d69f65c0c64fa8a02`,
  })
  @MaxLength(255)
  vendorType: string;

  @IsNotEmpty()
  @IsNumber()
  @Type(() => Number)
  @ApiProperty({
    description: "Page",
    required: true,
    example: 1,
  })
  page: number;

  @IsNotEmpty()
  @IsNumber()
  @Max(100)
  @Min(1)
  @Type(() => Number)
  @ApiProperty({
    description: "Limit",
    required: true,
    example: 10,
  })
  limit: number;
}

export class ListUserSuccess {
  @ApiProperty({
    example: UserMessageSuccess.ListUserSuccessfully,
  })
  message: string;

  @ApiProperty({
    example: [
      {
        _id: "63db39efddfac2cd45c94504",
        createdAt: "2023-02-02T04:19:58.613Z",
        updatedAt: "2023-02-02T04:19:58.613Z",
        firstName: "admin",
        lastName: "admin",
        typeOfUser: "Admin",
        email: "admin",
        status: "Active",
        __v: 0,
      },
      {
        _id: "63db6926d9996b318558f271",
        createdAt: "2023-02-02T07:41:25.229Z",
        updatedAt: "2023-02-02T07:41:25.229Z",
        firstName: "test@gmail.com",
        lastName: "test@gmail.com",
        typeOfUser: "Admin",
        email: "test@gmail.com",
        status: "Active",
        __v: 0,
      },
    ],
  })
  data: any;

  @ApiProperty({
    example: HttpStatus.OK,
  })
  statusCode: number;

  @ApiProperty({
    example: {
      page: 1,
      limit: 10,
      currentPage: 1,
      count: 5,
      total: 5,
    },
  })
  "metadata": any;
}
