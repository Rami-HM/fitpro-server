import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class GanttService {
    constructor(private readonly prisma: PrismaService) {
        prisma.$on<any>('query', (event: Prisma.QueryEvent) => {
            console.log('Query: ' + event.query);
            console.log('Duration: ' + event.duration + 'ms');
        });
    }

    async ganttTaskList(mem_idx:number): Promise<any> {
        try {

            const result = await this.prisma.$queryRaw(
                `WITH RECURSIVE TASKTREE
                AS
                (
                    SELECT 
                         CONCAT('P',PRJ_IDX) AS IDX, NULL AS UPPER_IDX, PRJ_IDX , 
                         NULL AS TASK_IDX, PRJ_TITLE AS TITLE, PRJ_START AS START, PRJ_START, PRJ_END AS END, 
                         CONCAT('P',ROWNUM) AS PATH 
                    FROM (SELECT (ROW_NUMBER() OVER(ORDER BY PRJ_START)) AS ROWNUM, P.* FROM PROJECT P) TBL1 
                    UNION
                    SELECT 
                        TASK_IDX::TEXT AS IDX, CONCAT('P',TASK.PRJ_IDX) AS UPPER_IDX, TBL2.PRJ_IDX, 
                        TASK_IDX ,TASK_TITLE AS TITLE ,TASK_START AS START, NULL AS PRJ_START ,TASK_END AS END,
                        CONCAT('P',ROWNUM,'>',TASK_IDX) AS PATH
                    FROM TASK LEFT JOIN (SELECT (ROW_NUMBER() OVER(ORDER BY PRJ_START)) AS ROWNUM, PRJ_IDX FROM PROJECT P) TBL2 ON TASK.PRJ_IDX = TBL2.PRJ_IDX
                    WHERE UPPER_TASK_IDX IS NULL
                    UNION
                    SELECT 
                        T.TASK_IDX::TEXT AS IDX, T.UPPER_TASK_IDX::TEXT AS UPPER_IDX,  T.PRJ_IDX,
                        T.TASK_IDX  ,T.TASK_TITLE AS TITLE ,T.TASK_START AS START, NULL AS PRJ_START ,T.TASK_END AS END,
                        TR.PATH || '>' || T.TASK_IDX AS PATH 
                    FROM TASKTREE TR
                    LEFT JOIN TASK T ON TR.TASK_IDX = T.UPPER_TASK_IDX
                )SELECT * FROM TASKTREE 
                TTR LEFT JOIN PROJECT_ASSIGN PA ON (TTR.PRJ_IDX = PA.PRJ_IDX) 
                WHERE PA.MEM_IDX = ${mem_idx}  AND IDX IS NOT NULL ORDER BY PATH`
            );

            return ({
                status: 200,
                message: 'gant task List',
                data: result
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "리스트를 불러오는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }
}
