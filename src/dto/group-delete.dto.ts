import { PartialType } from '@nestjs/mapped-types';
import { Prisma } from '@prisma/client';
import { IsIn, IsNumber, IsOptional } from 'class-validator';

// export class GroupDeleteDTO implements Prisma.GroupWhereUniqueInput {
//   @IsIn(['Y', 'N'])
//   useYn: string;

//   @IsNumber()
//   id: number;
// }
