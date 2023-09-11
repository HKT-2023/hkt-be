import { ApiProperty } from "@nestjs/swagger";
import {
  IsArray,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";
import { UpdateUserDto } from "src/modules/user/dto/update-user.dto";
import { Type } from "class-transformer";
import { SocialMedia, TypeSocialMedia } from "src/modules/user/user.const";

export class UpdateAgentDto extends UpdateUserDto {
  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Agent name",
    required: false,
    example: "Jax",
  })
  @MaxLength(255)
  agentName: string;

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
  @IsNotEmpty()
  @ApiProperty({
    description: "Agent email",
    required: false,
    example: "agentEmail@gmail.com",
  })
  agentEmail: string;

  @IsArray()
  @Type(() => TypeSocialMedia)
  @ApiProperty({
    description: "Social media",
    required: false,
    example: [
      { type: SocialMedia.TikTok, link: "TikTok.link.com" },
      { type: SocialMedia.Instagram, link: "Instagram.link.com" },
      { type: SocialMedia.LinkedIn, link: "LinkedIn.link.com" },
      { type: SocialMedia.Facebook, link: "Facebook.link.com" },
      { type: SocialMedia.Twitter, link: "Twitter.link.com" },
    ],
  })
  socialMedia: TypeSocialMedia[];

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: "Description",
    required: false,
    example: "An example description",
  })
  @MaxLength(1000)
  description: string;
}

export class CreateAgentSuccess {
  @ApiProperty({
    example: {
      createdAt: "2023-02-02T07:57:57.483Z",
      updatedAt: "2023-02-02T07:57:57.483Z",
      avatarUrl: "https//image.org/0123.jpg",
      firstName: "John",
      lastName: "Nguyen",
      typeOfUser: "Agent",
      email: "exampleEmail1@gmail.com",
      phone: "01818464638",
      gender: "Male",
      dateOfBirth: "2020-01-11",
      status: "Active",
      agentName: "Jax",
      license: "XXXX-XXXX-XXXX",
      agentEmail: "agentEmail@gmail.com",
      _id: "63db6d30abe47ba51a1cd411",
      __v: 0,
    },
  })
  data: any;
}
