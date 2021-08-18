import { Prisma } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsDate, IsEmail, IsOptional, IsString } from 'class-validator';

export class MemberCreateDTO implements Prisma.memberCreateInput {

    @IsString()
    mem_id: string;
    @IsString()
    mem_pwd: string;
    @IsString()
    mem_name: string;
    @IsEmail()
    mem_email: string;

    @Type(()=> Date)
    @IsDate()
    mem_birth?: string | Date;
    @IsString()
    mem_affil?: string;
    @IsString()
    mem_profile?: string;


    mem_idx?: number ;
    reg_date: string | Date | null;
    upt_date?: string | Date;
    project_assign?: Prisma.project_assignCreateNestedManyWithoutMemberInput;
}

