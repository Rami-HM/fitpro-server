import { Prisma } from "@prisma/client";
import { IsByteLength, IsNumber, IsString } from "class-validator";
import { Type } from 'class-transformer';

export class ProjectCreateDTO implements Prisma.projectCreateInput{
    @IsString()
    @IsByteLength(0,4000)
    prj_title: string;
    @IsString()
    @IsByteLength(0,4000)
    prj_sub_title: string;
    @IsString()
    prj_contents: string;
    @Type(()=> Date)
    prj_start: string | Date;
    @Type(()=> Date)
    prj_end?: string | Date;

    @IsNumber()
    reg_mem_idx: number;

    useyn?: boolean;
    reg_date?: string | Date | null;
    upt_date?: string | Date | null;
    upt_mem_idx?: number;
    file_info?: Prisma.file_infoCreateNestedManyWithoutProjectInput;
    task?: Prisma.taskCreateNestedManyWithoutProjectInput;
}