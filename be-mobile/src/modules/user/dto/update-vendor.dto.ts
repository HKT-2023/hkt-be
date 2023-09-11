import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { UpdateUserDto } from "src/modules/user/dto/update-user.dto";

export class UpdateVendorDto extends UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Business name",
    required: false,
    example: "Money",
  })
  @MaxLength(255)
  businessName: string;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Primary contact",
    required: false,
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

  @IsOptional()
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

export class UpdateVendorSuccess {
  @ApiProperty({
    example: {
      createdAt: "2023-02-07T02:59:07.015Z",
      updatedAt: "2023-02-07T02:59:07.016Z",
      avatarUrl: "https://cdn-icons-png.flaticon.com/512/3135/3135715.png",
      firstName: "John",
      lastName: "Nguyen",
      typeOfUser: "Vendor",
      email: "exampleEmail22@gmail.com",
      password: "",
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
