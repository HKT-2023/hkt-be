import { ApiProperty, OmitType } from "@nestjs/swagger";
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import {
  CreateUserDto,
  CreateUserSuccess,
} from "src/modules/user/dto/create-user.dto";

export class CreateVendorDto extends OmitType(CreateUserDto, [
  "typeOfUser",
  "firstName",
  "lastName",
]) {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Business name",
    required: true,
    example: "Money",
  })
  @MaxLength(255)
  businessName: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "Primary contact",
    required: true,
    example: "Money",
  })
  @MaxLength(255)
  primaryContact: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "License",
    required: false,
    example: "XXXX-XXXX-XXXX",
  })
  @MaxLength(255)
  license: string;

  @IsEmail()
  @IsOptional()
  @ApiProperty({
    description: "Vendor email",
    required: false,
    example: "vendorEmail@gmail.com",
  })
  vendorEmail: string;

  @IsOptional()
  @ApiProperty({
    description: "Vendor location",
    required: false,
    example: "Vietnam",
  })
  @MaxLength(255)
  vendorLocation: string;

  @IsArray()
  @ApiProperty({
    description: "Vendor type ",
    required: true,
    example: ["64255d32283b7f46df302516", "63ec865469f65c0c64fa8b82"],
  })
  vendorType: string[];

  @IsOptional()
  @ApiProperty({
    description: "Description",
    required: false,
    example: "An example description",
  })
  @MaxLength(1000)
  description: string;
}

export class UpdateVendorDto extends OmitType(CreateVendorDto, [
  "password",
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

export class CreateVendorSuccess extends CreateUserSuccess {
  @ApiProperty({
    example: {
      createdAt: "2023-02-07T02:59:07.015Z",
      updatedAt: "2023-02-07T02:59:07.016Z",
      avatarUrl: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      firstName: "John",
      lastName: "Nguyen",
      typeOfUser: "Vendor",
      email: "exampleEmail22@gmail.com",
      phone: "01818464638",
      dateOfBirth: "01/29/2023",
      status: "Active",
      license: "",
      businessName: "Money",
      repOrOwnerName: "Mr john",
      vendorEmail: "vendorEmail@gmail.com",
      vendorLocation: "Vietnam",
      vendorType: "FurnitureStaging",
      description: "An example description",
      _id: "63e1c440446ab5fbb77598d7",
      __v: 0,
    },
  })
  data: any;
}
