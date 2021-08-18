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

    //O(매우높음), A(높음), B(중간), C(낮음)
    @IsIn(['O','A','B','C'])
    @IsOptional()
    task_important: string;
    //SH(예정됨), PG(진행중), PD(보류), CP(완료됨), FL(미처리)
    @IsIn(['SH','PG','PD','CP','FL'])
    @IsOptional()
    task_state: string;

    reg_date?: string | Date;
    upt_date?: string | Date;
    upt_mem_idx?: number;
    fail_reason?: Prisma.fail_reasonCreateNestedOneWithoutTaskInput;
    project: Prisma.projectCreateNestedOneWithoutTaskInput;
    task?: Prisma.taskCreateNestedOneWithoutOther_taskInput;
    other_task?: Prisma.taskCreateNestedManyWithoutTaskInput;

}

