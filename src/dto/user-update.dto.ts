import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsNumber, IsOptional } from 'class-validator';
import { UserCreateDTO } from './user-create.dto';

//Validation
export class UserUpdateDTO extends PartialType(UserCreateDTO) {
  @IsOptional() //선택적으로
  memo?: string;

  @IsNumber()
  id: number;

  @IsIn(['Y', 'N'])
  bookMarkYN: string;
}
