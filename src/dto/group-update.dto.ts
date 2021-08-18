import { PartialType } from '@nestjs/mapped-types';
import { IsNumber, IsOptional } from 'class-validator';

import { GroupCreateDTO } from './group-create.dto';

export class GroupUpdateDTO extends PartialType(GroupCreateDTO) {
  @IsOptional()
  groupRank: number;

  @IsNumber()
  id: number;
}
