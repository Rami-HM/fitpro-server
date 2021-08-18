import { PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

//Validation
export class UserCreateDTO {
  // @IsString()
  // tel: string;
  // @IsEmail()
  // email: string;
  // @IsString()
  // @IsNotEmpty()
  // name: string;
  // bookMarkYN?: string;

  // memo?: string;
  // useYn?: string;
  // regDate?: string | Date;
  // group: Prisma.GroupCreateNestedOneWithoutUsersInput;
}
