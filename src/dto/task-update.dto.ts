import { Prisma } from '@prisma/client';
import { IsDate, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { TaskCreateDTO } from './task-create.dto';

export class TaskUpdateDTO extends TaskCreateDTO {

}

