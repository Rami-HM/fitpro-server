import { IsIn,  IsOptional } from 'class-validator';
import { SubTaskCreateDTO } from './subTask-create.dto';

export class SubTaskUpdateDTO extends SubTaskCreateDTO {


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

