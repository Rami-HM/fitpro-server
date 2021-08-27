import { Prisma, fail_reason } from '@prisma/client';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
@Injectable()
export class FailService {
    constructor(private readonly prisma: PrismaService) {}

    async getFailReason(): Promise<any> {
        try {
            const result = await this.prisma.fail_reason.findMany({
                orderBy:{reg_date:'desc'}
            });
            
            return ({
                status: 200,
                message: '완료!',
                data: result
            });


        } catch (error) {
            throw new HttpException(error['response'] ? error['response'] : "미처리 사유를 불러오는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }
}
