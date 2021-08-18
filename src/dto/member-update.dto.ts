import { MemberCreateDTO } from './member-create.dto';
import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsNumber, IsOptional } from 'class-validator';

//Validation
export class MemberUpdateDTO extends PartialType(MemberCreateDTO) {
  
}
