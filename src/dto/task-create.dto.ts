import { Prisma } from '@prisma/client';
import { IsDate, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';

export class TaskCreateDTO implements Prisma.taskCreateInput {

    @IsNumber()
    prj_idx: number;

    @IsString()
    task_title: string;

    @IsOptional()
    @IsString()
    task_memo?: string;

    @IsDate()
    task_start: string | Date;
    @IsDate()
    task_end?: string | Date;

    @IsNumber()
    reg_mem_idx: number;

    reg_date?: string | Date;
    project: Prisma.projectCreateNestedOneWithoutTaskInput;
}

