import { ApiProperty, OmitType } from "@nestjs/swagger";
import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsNumber,
  IsString,
  MaxLength,
  IsOptional,
  ValidateIf,
} from "class-validator";
import { UserMessageError } from '../user.const';
import {
  CreateUserDto,
  CreateUserSuccess,
} from "src/modules/user/dto/create-user.dto";
import { TypeOfUser } from "src/modules/user/user.const";
import { Type } from "class-transformer";
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { UserType } from 'src/models/schemas/course.schema';

export function CommissionValidateForUser(property: string, validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'CommissionValidateForUser',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [property],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [relatedPropertyName] = args.constraints;
          const relatedValue = (args.object as any)[relatedPropertyName];
          console.log('(args.object as any)[relatedPropertyName]', relatedValue);
          console.log('value', value);
          // return false;
          return value && value >= 0 && value <= 100 && relatedValue === TypeOfUser.KlaytnAgent || relatedValue !== TypeOfUser.KlaytnAgent
        },
      },
    });
  };
}

export enum TypeOfAgentAllow {
  NonKlaytnAgent = TypeOfUser.NonKlaytnAgent,
  KlaytnAgent = TypeOfUser.KlaytnAgent,
}

export class CreateAgentDto extends CreateUserDto {
  @IsEnum(TypeOfAgentAllow)
  @ApiProperty({
    description:
      "Type of user want to create. Support only non Klaytn agent and Klaytn agent in this API",
    required: true,
    example: `${TypeOfUser.NonKlaytnAgent} | ${TypeOfUser.KlaytnAgent}`,
  })
  typeOfUser: TypeOfUser;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: "ListAgentMlsId to matching bridge and local agent ",
    required: true,
    example: "XXXX-XXXX-XXXX",
  })
  @MaxLength(255)
  listAgentMlsId: string;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: "License",
    required: true,
    example: "XXXX-XXXX-XXXX",
  })
  @MaxLength(255)
  license: string;

  @IsEmail()
  @IsNotEmpty()
  @ApiProperty({
    description: "Agent email",
    required: true,
    example: "agentEmail@gmail.com",
  })
  agentEmail: string;

  @IsArray()
  @Type(() => TypeSocialMedia)
  @ApiProperty({
    description: "Social media",
    required: false,
    example: [
      { type: "facebook", link: "facebook.link.com" },
      { type: "instagram", link: "instagram.link.com" },
    ],
  })
  socialMedia: TypeSocialMedia[];

  @IsString()
  @ApiProperty({
    description: "Description",
    required: false,
    example:
      "Social media could be a link to Facebook, Instagram, LinkedIn, Twitter, TikTok",
  })
  @MaxLength(1000)
  description: string;

  @ValidateIf(o => o.typeOfUser === UserType.KlaytnAgent)
  @IsNumber()
  @IsNotEmpty()
  @CommissionValidateForUser('typeOfUser', {
    message: UserMessageError.CommissionInvalid
  })
  @ApiProperty({
    description:
      "Only KLAYTN agents can have a commission field " +
      "The commission could be less than or equal to 100 " +
      "The unit is the percentage (%)" +
      "Apply for the admin web only",
    required: true,
    example:
      "12",
  })
  commission: number;
}

export enum SocialMedia {
  Facebook = "facebook",
  Twitter = "twitter",
  Instagram = "instagram",
  LinkedIn = "linkedIn",
  TikTok = "tikTok",
}

export class TypeSocialMedia {
  type: SocialMedia;
  link: string;
}

export class UpdateAgentDto extends OmitType(CreateAgentDto, [
  "typeOfUser",
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

export class CreateAgentSuccess extends CreateUserSuccess {
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
