import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class CalendarService {
    constructor(private readonly prisma: PrismaService) {
        prisma.$on<any>('query', (event: Prisma.QueryEvent) => {
            console.log('Query: ' + event.query);
            console.log('Duration: ' + event.duration + 'ms');
        });
    }

    async calendarTasklist(prj_idx: number): Promise<any> {
        try {

            const result = await this.prisma.$queryRaw(
                `WITH RECURSIVE TASKTREE AS
                (   SELECT 
                        TASK_IDX, TASK_TITLE, TASK_MEMO, TASK_START, TASK_END, UPPER_TASK_IDX, REG_MEM_IDX, 
                        TASK_IMPORTANT, TASK_STATE, FAIL_IDX, PRJ_IDX, NULL::VARCHAR AS UPPER_TITLE, TASK_IDX::TEXT AS PATH 
                    FROM TASK 
                    WHERE UPPER_TASK_IDX IS NULL
                    UNION
                    SELECT 
                        T.TASK_IDX,T.TASK_TITLE,T.TASK_MEMO,T.TASK_START,T.TASK_END,T.UPPER_TASK_IDX,T.REG_MEM_IDX,
                        T.TASK_IMPORTANT,T.TASK_STATE,T.FAIL_IDX,T.PRJ_IDX, TR.TASK_TITLE AS UPPER_TITLE, TR.PATH || '>' || T.TASK_IDX::TEXT AS PATH 
                    FROM TASKTREE TR
                    LEFT JOIN TASK T ON TR.TASK_IDX = T.UPPER_TASK_IDX
                )
                SELECT TASK_IDX, TASK_TITLE, TASK_START, TASK_END, UPPER_TASK_IDX, PRJ_IDX, UPPER_TITLE, PATH 
                FROM TASKTREE 
                WHERE TASK_IDX IS NOT NULL 
                AND UPPER_TASK_IDX IS NOT NULL /* 서브할일만 */
                AND PRJ_IDX = ${prj_idx}
                ORDER BY PATH`
            );

            return ({
                status: 200,
                message: 'calendar Tree List',
                data: result
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "리스트를 불러오는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

}
