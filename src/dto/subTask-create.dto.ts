import { Prisma, fail_reason } from '@prisma/client';
import { IsDate, IsIn, IsNumber, IsOptional, IsString } from 'class-validator';
import { TaskCreateDTO } from './task-create.dto';

export class SubTaskCreateDTO extends TaskCreateDTO {


    //O(매우높음), A(높음), B(중간), C(낮음)
    @IsIn(['O','A','B','C'])
    task_important: string;
    //SH(예정됨), PG(진행중), PD(보류), CP(완료됨), FL(미처리)
    @IsIn(['SH','PG','PD','CP','FL'])
    task_state: string;

    @IsOptional()
    upper_task_idx: number;

    @IsOptional()
    fail_idx: string;

    @IsOptional()
    fail_contents:string;

}

