import { Prisma } from '@prisma/client';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class MemberLoginDTO implements Prisma.memberWhereUniqueInput {

    @IsString()
    mem_id: string;
    @IsString()
    mem_pwd: string;

}

