import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatsService {
    constructor(private readonly prisma: PrismaService) {
        prisma.$on<any>('query', (event: Prisma.QueryEvent) => {
            console.log('Query: ' + event.query);
            console.log('Duration: ' + event.duration + 'ms');
        });
    }

    async totalTasknum(prj_idx: number): Promise<any> {
        try {
            const result = await this.prisma.$queryRaw(
                `select 
                    tbl2.PRJ_IDX, coalesce (MAIN_TASK_CNT, 0)as MAIN_TASK_CNT, coalesce (SUB_TASK_CNT,0) as SUB_TASK_CNT
                from PROJECT TBL1
                left join (
                select
                    PRJ_IDX,
                    SUM(case when UPPER_TASK_IDX is null then 1 else 0 end) as MAIN_TASK_CNT,
                    SUM(case when UPPER_TASK_IDX is not null then 1 else 0 end) as SUB_TASK_CNT
                from
                    TASK
                group by
                    PRJ_IDX
                having
                    PRJ_IDX = ${prj_idx}) TBL2
                on TBL1.prj_idx = tbl2.prj_idx
                where TBL1.PRJ_IDX = ${prj_idx}`);
            return ({
                status: 200,
                message: '프로젝트 의 전체 할일의 개수 통계가 생성 됬어요!',
                data: result[0]
            });
        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "통계 도출에 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }
    async total(prj_idx: number, query): Promise<any> {
        try {
            const { mem_idx } = query;
            const result = await this.prisma.$queryRaw(
                `WITH STATE_DESC AS(
                    SELECT 'SH' AS TASK_STATE, '예정됨' AS TASK_STATE_DESC
                    UNION 
                    SELECT 'PG' AS TASK_STATE, '진행중' AS TASK_STATE_DESC
                    UNION 
                    SELECT 'PD' AS TASK_STATE, '보류' AS TASK_STATE_DESC
                    UNION 
                    SELECT 'CP' AS TASK_STATE, '완료됨' AS TASK_STATE_DESC
                    UNION 
                    SELECT 'FL' AS TASK_STATE, '미처리' AS TASK_STATE_DESC
                )
                SELECT
                    TBL2.TASK_STATE, TBL2.TASK_STATE_DESC, COALESCE (CNT,0) as cnt
                FROM
                    (
                    SELECT
                        PRJ_IDX,
                        TASK_STATE,
                        COUNT(TASK_STATE) AS CNT
                    FROM	
                    (SELECT * FROM
                        TASK WHERE UPPER_TASK_IDX IS NOT NULL
                        ` + (mem_idx ? (` AND REG_MEM_IDX = ${mem_idx}`) : ``) + `
                    ) T
                    GROUP BY
                        T.PRJ_IDX,
                        TASK_STATE
                    HAVING
                         (TASK_STATE IS NOT NULL
                            AND TASK_STATE != '' AND T.PRJ_IDX = ${prj_idx})
                        ) TBL1
                RIGHT JOIN STATE_DESC TBL2
                ON TBL1.TASK_STATE = TBL2.TASK_STATE
                ORDER BY
                    CASE
                        (TBL2.TASK_STATE) 
                        WHEN 'CP' THEN '1'
                        WHEN 'SH' THEN '2'
                        WHEN 'PG' THEN '3'
                        WHEN 'PD' THEN '4'
                        WHEN 'FL' THEN '5'
                    END`);

            return ({
                status: 200,
                message: '프로젝트 의 전체 할일의 개수 통계가 생성 됬어요!',
                data: result
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "통계 도출에 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async assignStats(prj_idx: number): Promise<any> {
        try {
            const result = await this.prisma.$queryRaw(
                `select 
                    pa.mem_idx, m.mem_name,
                    CONCAT('${process.env.CDN_URL}',m.mem_profile) as mem_profile,
                    coalesce(comple_cnt,0) as comple_cnt,coalesce(total_cnt,0) as total_cnt
                from project_assign pa
                left join (
                    select 
                        reg_mem_idx,
                        sum(case task_state when 'CP' then cnt else 0 end) as comple_cnt,
                        sum(cnt) as total_cnt
                    from(
                        select reg_mem_idx, task_state, count(task_state) as cnt
                        from (
                            select * from task where prj_idx = ${prj_idx} and task_state is not null
                            )t 
                        group by (reg_mem_idx, task_state)
                    )tb
                    group by reg_mem_idx
                ) as tbl1
                on pa.mem_idx = tbl1.reg_mem_idx
                left join member m
                on pa.mem_idx = m.mem_idx
                where pa.prj_idx = ${prj_idx}`);

            return ({
                status: 200,
                message: '프로젝트 의 통계가 생성 됬어요!',
                data: result
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "통계 도출에 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }
}
