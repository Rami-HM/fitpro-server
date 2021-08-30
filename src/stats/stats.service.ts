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

    async failStats(prj_idx: number): Promise<any> {
        try {
            const result = await this.prisma.$queryRaw(
                `SELECT 
                    FR.FAIL_IDX, FAIL_CONTENTS, COALESCE(CNT,0) AS CNT 
                FROM FAIL_REASON FR
                LEFT JOIN (
                    SELECT 
                        FAIL_IDX, COUNT(FAIL_IDX) AS CNT  
                    FROM(
                        SELECT * 
                        FROM TASK 
                        WHERE FAIL_IDX IS NOT NULL 
                        AND PRJ_IDX = ${prj_idx}
                    )TB 
                    GROUP BY FAIL_IDX
                ) TBL1
                ON FR.FAIL_IDX  = TBL1.FAIL_IDX`);

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

    async mainCntStats(prj_idx: number): Promise<any> {
        try {
            const result = await this.prisma.$queryRaw(
                `SELECT T.TASK_IDX, TASK_TITLE, TASK_MEMO, 
                COALESCE(CNT,0) as total_cnt, COALESCE(comple_cnt,0) as comple_cnt
                FROM TASK T 
                RIGHT JOIN (
                    SELECT UPPER_TASK_IDX, COUNT(UPPER_TASK_IDX) AS CNT
                    FROM (
                        SELECT * 
                        FROM TASK 
                        WHERE PRJ_IDX = ${prj_idx} AND UPPER_TASK_IDX IS NOT NULL
                    ) T GROUP BY UPPER_TASK_IDX
                ) TBL1
                ON T.TASK_IDX = TBL1.UPPER_TASK_IDX
                LEFT JOIN (
                SELECT UPPER_TASK_IDX, count(UPPER_TASK_IDX) as comple_cnt
                FROM (
                       SELECT * 
                        FROM TASK 
                        WHERE PRJ_IDX = ${prj_idx} AND UPPER_TASK_IDX IS NOT null and TASK_STATE = 'CP'
                    )TB
                    group by UPPER_TASK_IDX, task_state
                )TBL2
                on tbl1.upper_task_idx = tbl2.upper_task_idx`
            );

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

    async recentTaskStats(prj_idx: number): Promise<any> {
        try {
            const result = await this.prisma.$queryRaw(
                `SELECT * FROM(
                    SELECT TASK_IDX, TASK_TITLE, TASK_MEMO, 
                        CONCAT(TO_CHAR(T.TASK_START, 'YYYY-MM-DD'),'T',TO_CHAR(T.TASK_START, 'HH24:MI')) AS TASK_START,
                        CONCAT(TO_CHAR(T.TASK_END, 'YYYY-MM-DD'),'T',TO_CHAR(T.TASK_END, 'HH24:MI')) AS TASK_END,
                        (SELECT TASK_TITLE FROM TASK WHERE TASK_IDX = T.UPPER_TASK_IDX) AS MAIN_TASK,
                        (CASE
                            (T.TASK_IMPORTANT) 
                            WHEN 'O' THEN '매우높음'
                            WHEN 'A' THEN '높음'
                            WHEN 'B' THEN '중간'
                            WHEN 'C' THEN '낮음'
                        END) AS TASK_IMPORTANT_DESC,
                        MEM_IDX,
                        MEM_NAME,
                        CONCAT('${process.env.CDN_URL}',M.MEM_PROFILE) AS MEM_PROFILE,
                        TO_CHAR(T.TASK_START, 'YYYY-MM-DD HH24:MI:SS') AS TASK_START_DESC, 
                        TO_CHAR(T.TASK_END, 'YYYY-MM-DD HH24:MI:SS') AS TASK_END_DESC,
                        TASK_STATE,
                        (CASE
                            (T.TASK_STATE)
                            WHEN 'SH' THEN '예정됨'
                            WHEN 'PG' THEN '진행중'
                            WHEN 'PD' THEN '보류'
                            WHEN 'CP' THEN '완료됨'
                            WHEN 'FL' THEN '미처리'
                        END) AS TASK_STATE_DESC
                    FROM TASK T LEFT JOIN MEMBER M
                    ON T.REG_MEM_IDX = M.MEM_IDX
                    WHERE PRJ_IDX = ${prj_idx}
                    AND TASK_STATE IN ('SH','PG')
                    ORDER BY (TASK_END - NOW())) TBL
                LIMIT 3`
            );

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
