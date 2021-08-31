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

    async ganttTaskList(mem_idx: number): Promise<any> {
        try {

            const result = await this.prisma.$queryRaw(
                `WITH RECURSIVE TASKTREE
                AS
                (
                    SELECT 
                        CONCAT('P',PRJ_IDX) AS IDX, NULL AS UPPER_IDX, PRJ_IDX , 
                        NULL AS TASK_IDX, PRJ_TITLE AS TITLE, to_char(PRJ_START, 'YYYY-MM-DD HH24:MI:SS') AS SDATE, PRJ_START, to_char(PRJ_END , 'YYYY-MM-DD HH24:MI:SS') AS EDATE, 
                        CONCAT('P',ROWNUM) AS path, null::text as important
                    FROM (SELECT (ROW_NUMBER() OVER(ORDER BY PRJ_START)) AS ROWNUM, P.* FROM PROJECT P) TBL1 
                    UNION
                    SELECT 
                        TASK_IDX::TEXT AS IDX, CONCAT('P',TASK.PRJ_IDX) AS UPPER_IDX, TBL2.PRJ_IDX, 
                        TASK_IDX ,TASK_TITLE AS TITLE ,to_char(TASK_START , 'YYYY-MM-DD HH24:MI:SS') AS SDATE, NULL AS PRJ_START ,to_char(TASK_END , 'YYYY-MM-DD HH24:MI:SS') AS EDATE,
                        CONCAT('P',ROWNUM,'>',TASK_IDX) AS path, null::text as important
                    FROM TASK LEFT JOIN (SELECT (ROW_NUMBER() OVER(ORDER BY PRJ_START)) AS ROWNUM, PRJ_IDX FROM PROJECT P) TBL2 ON TASK.PRJ_IDX = TBL2.PRJ_IDX
                    WHERE UPPER_TASK_IDX IS NULL
                    UNION
                    SELECT 
                        T.TASK_IDX::TEXT AS IDX, T.UPPER_TASK_IDX::TEXT AS UPPER_IDX,  T.PRJ_IDX,
                        T.TASK_IDX  ,T.TASK_TITLE AS TITLE , to_char(T.TASK_START , 'YYYY-MM-DD HH24:MI:SS') AS SDATE, NULL AS PRJ_START ,to_char(T.TASK_END , 'YYYY-MM-DD HH24:MI:SS') AS EDATE,
                        TR.PATH || '>' || T.TASK_IDX AS path, T.task_important as important
                    FROM TASKTREE TR
                    LEFT JOIN TASK T ON TR.TASK_IDX = T.UPPER_TASK_IDX
                )SELECT 
                TTR.idx as id,
                TTR.idx,
                TTr.path,
                title,
                TITLE as name,
                UPPER_IDX, sDate, eDate,
                round(
                    ((extract(day from EDATE::timestamp -SDATE::timestamp)*24*60) + 
                    (extract(hour from EDATE::timestamp -SDATE::timestamp)*60) + 
                    (extract(minutes from EDATE::timestamp -SDATE::timestamp)))::numeric,3)::int8 as duration,
                'minute' as durationUnit,
                CONCAT(round(
                    ((extract(day from EDATE::timestamp -SDATE::timestamp)*24*60) + 
                    (extract(hour from EDATE::timestamp -SDATE::timestamp)*60) + 
                    (extract(minutes from EDATE::timestamp -SDATE::timestamp)))::numeric,3)::int8,'minute') as duration_desc,
                important,
                (case
		            (important) 
		            when 'O' then '매우높음'
		            when 'A' then '높음'
		            when 'B' then '중간'
		            when 'C' then '낮음'
		        end) as important_desc
                FROM TASKTREE TTR LEFT JOIN PROJECT_ASSIGN PA 
                ON (TTR.PRJ_IDX = PA.PRJ_IDX) 
                WHERE PA.MEM_IDX = ${mem_idx}  AND IDX IS NOT NULL ORDER BY PATH`
            );

            // const newResult = await this.unflatten(result);
            
            // console.log(newResult);
             
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

    unflatten = async(arr) =>{
        var tree = [],
            mappedArr = {},
            arrElem,
            mappedElem;
  
        // First map the nodes of the array to an object -> create a hash table.
        for(var i = 0, len = arr.length; i < len; i++) {
          arrElem = arr[i];
          mappedArr[arrElem.idx] = arrElem;
          mappedArr[arrElem.idx]['children'] = [];
        }
  
  
        for (var id in mappedArr) {
            if (mappedArr.hasOwnProperty(id)) {
                mappedElem = mappedArr[id];
                
            // If the element is not at the root level, add it to its parent array of children.
            if (mappedElem.upper_idx) {
              mappedArr[mappedElem['upper_idx']]['children'].push(mappedElem);
            }
            // If the element is at the root level, add it to first level elements array.
            else {
              tree.push(mappedElem);
            }
          }
        }
        return tree;
    }  
}
