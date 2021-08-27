import { TaskUpdateDTO } from './../dto/task-update.dto';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { fail_reason, Prisma, task } from '@prisma/client';
import { SubTaskCreateDTO } from '../dto/subTask-create.dto';
import { SubTaskUpdateDTO } from '../dto/subTask-update.dto';
import { TaskCreateDTO } from '../dto/task-create.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TaskService {
    constructor(private readonly prisma: PrismaService) {
        prisma.$on<any>('query', (event: Prisma.QueryEvent) => {
            console.log('Query: ' + event.query);
            console.log('Duration: ' + event.duration + 'ms');
        });
    }

    selectQueryCommon = ` T.task_idx,
                    T.task_title,
                    T.task_memo,
                    CONCAT(to_char(T.task_start, 'YYYY-MM-DD'),'T',to_char(T.task_start, 'HH24:MI')) as task_start,
                    CONCAT(to_char(T.task_end, 'YYYY-MM-DD'),'T',to_char(T.task_end, 'HH24:MI')) as task_end,
                    T.upper_task_idx,
                    T.reg_date,
                    T.reg_mem_idx,
                    T.upt_date,
                    T.upt_mem_idx,
                    T.task_important,
                    T.task_state,
                    T.fail_idx,
                    T.prj_idx`;

    selectQueryDescDate = ` 
        to_char(T.task_start, 'YYYY-MM-DD HH24:MI:SS') as task_start_desc, 
        to_char(T.task_end, 'YYYY-MM-DD HH24:MI:SS') as task_end_desc`;

    selectQueryDescInfo = ` 
        (case
            (T.task_important) 
            when 'O' then '매우높음'
            when 'A' then '높음'
            when 'B' then '중간'
            when 'C' then '낮음'
        end) as task_important_desc,
        (case
            (T.task_state)
            when 'SH' then '예정됨'
            when 'PG' then '진행중'
            when 'PD' then '보류'
            when 'CP' then '완료됨'
            when 'FL' then '미처리'
        end) as task_state_desc`;

    async registerFailReason(obj: Object): Promise<fail_reason> {
        try {

            //미처리 사유가 등록 되었을 경우( 작성 )
            const failResult = await this.prisma.fail_reason.create({
                data: {
                    fail_contents: obj['fail_contents'],
                    reg_mem_idx: obj['reg_mem_idx']
                }
            });

            return failResult;
        }
        catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "미처리 사유 생성에 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }
    async register(body: TaskCreateDTO): Promise<any> {
        try {
            //mainTask
            let data = await {
                task_title: body.task_title,
                task_memo: body.task_memo,
                task_start: new Date(body.task_start + ":00.000Z"),
                task_end: new Date(body.task_end + ":00.000Z"),
                reg_mem_idx: body.reg_mem_idx,
                task_important: null,
                task_state: null,
                project: { connect: { prj_idx: body.prj_idx } },
            }

            const result = await this.prisma.task.create({ data });
            const detailTask = await this.detail(result.task_idx);
            return ({
                status: 201,
                message: '할 일이 생성 됬어요!',
                data: detailTask.data
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "메인 할일 생성에 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async checkRegisterFailReson(body: SubTaskCreateDTO) {

        let failData: fail_reason = {
            fail_idx: body.fail_idx === '' || body.fail_idx === '-' ? null : +body.fail_idx,
            fail_contents: body.fail_contents,
            reg_mem_idx: body.reg_mem_idx,
            reg_date: new Date()
        };
        //미처리 사유가 등록 되었을 경우( 작성 )
        if (body.fail_idx === 'add') {
            failData = await this.registerFailReason({
                fail_contents: body.fail_contents,
                reg_mem_idx: body.reg_mem_idx
            });
        }
        delete body.fail_contents;

        return failData;
    }

    async subRegister(body: SubTaskCreateDTO): Promise<any> {
        try {

            const failData = await this.checkRegisterFailReson(body);

            //subTask
            let data: Prisma.taskUncheckedCreateInput = {
                ...body,
                task_start: new Date(body.task_start + ":00.000Z"),
                task_end: new Date(body.task_end + ":00.000Z"),
                fail_idx: failData.fail_idx,
                upper_task_idx: +body.upper_task_idx
            }
            const result = await this.prisma.task.create({ data });

            const detailTask = await this.detail(result.task_idx);

            return ({
                status: 201,
                message: '할 일이 생성 됬어요!',
                data: detailTask.data
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "메인 할일 생성에 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async projectTasklist(prj_idx: number): Promise<any> {
        try {

            const result = await this.prisma.$queryRaw(
                `select`
                + this.selectQueryCommon + `,` + this.selectQueryDescDate +
                `,(case
                    (case coalesce(T.task_important,'') when '' then B.task_important else T.task_important end)
                        when 'O' then '매우높음'
                        when 'A' then '높음'
                        when 'B' then '중간'
                        when 'C' then '낮음'
                    end) as task_important,
                    (case
                        task_state 
                        when 'SH' then '예정됨'
                        when 'PG' then '진행중'
                        when 'PD' then '보류'
                        when 'CP' then '완료됨'
                        when 'FL' then '미처리'
                    end) as task_state,
                    (select mem_name from member where mem_idx = T.reg_mem_idx) as worker
                from
                    task T 
                left join 
                    (select upper_task_idx, task_important from(
                        select row_number() over(PARTITION by upper_task_idx order by cnt desc) as rnk, upper_task_idx, task_important
                        from(
                            select upper_task_idx, task_important, count(task_important) as cnt
                            from(
                                select * from task where prj_idx = ${prj_idx}
                            ) TBL1
                        group by upper_task_idx, task_important having upper_task_idx is not null) tbl2
                    ) TBL3 where rnk = 1) B
                on T.task_idx = B.upper_task_idx
                where
                    prj_idx = ${prj_idx}
                order by task_end, 
                    (case
                        (case coalesce(T.task_important,'') when '' then B.task_important else T.task_important end)
                        when 'O' then 0
                        when 'A' then 1
                        when 'B' then 2
                        when 'C' then 3
                    end)`
            );

            return ({
                status: 200,
                message: 'task list',
                data: result
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "리스트를 불러오는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }
    async detail(task_idx: number): Promise<any> {
        try {
            const result = await this.prisma.$queryRaw(
                `select`
                + this.selectQueryCommon + `,` + this.selectQueryDescDate + `,` + this.selectQueryDescInfo +
                `,p.prj_title,
                    fail_contents,
                    mem_name as worker,
                    CONCAT('${process.env.CDN_URL}',MEM_PROFILE) as worker_SRC,
                    (select task_title from task where task_idx = t.upper_task_idx) as main_task
                from
                    task T left join member m
                    on t.reg_mem_idx = m.mem_idx
                    left join fail_reason f
                    on T.fail_idx = f.fail_idx 
                    left join project p
                    on t.prj_idx = p.prj_idx
                where
                    task_idx = ${task_idx}`
            );

            return ({
                status: 200,
                message: '상세정보 불러오는데 성공했습니다.',
                data: result[0]
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "상세정보를 불러오는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async mylist(mem_idx: number, tap_index: number): Promise<any> {
        try {
            // to_char(task_start, 'YYYY-MM-DD HH24:MI:SS') as task_start,
            // to_char(task_end, 'YYYY-MM-DD HH24:MI:SS') as task_end,
            const result = await this.prisma.$queryRaw(
                `select
                    task_idx as id,
                `
                + this.selectQueryCommon + `,` + this.selectQueryDescDate + `,` + this.selectQueryDescInfo +
                `,p.prj_title,
                    (select task_title from task where task_idx = t.upper_task_idx) as main_task
                from
                    task T
                    left join project p
                    on t.prj_idx = p.prj_idx
                where
                    t.reg_mem_idx = ${mem_idx}`
                + (tap_index === 0 ? `AND upper_task_idx is not null` : `AND upper_task_idx is null`) +
                ` order by task_end, 
                    (case (task_important) 
                        when 'O' then 0
                        when 'A' then 1
                        when 'B' then 2
                        when 'C' then 3
                    end)`
            );

            return ({
                status: 200,
                message: 'task list',
                data: result
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "리스트를 불러오는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async modifyTaskState(task_idx: number, body: task): Promise<any> {
        try {
            const result = await this.prisma.task.update({
                where: { task_idx: task_idx },
                data: { task_state: body.task_state, fail_idx: null }
            })

            return ({
                status: 201,
                message: '수정되었습니다.',
                data: result
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "수정하는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async modifySubTask(task_idx: number, body: SubTaskUpdateDTO): Promise<any> {
        try {
            const failData = await this.checkRegisterFailReson(body);

            //subTask
            let data: Prisma.taskUncheckedUpdateInput = {
                task_title: body.task_title,
                task_memo: body.task_memo,
                task_important: body.task_important,
                task_state: body.task_state,
                reg_mem_idx: body.reg_mem_idx,
                task_start: new Date(body.task_start + ":00.000Z"),
                task_end: new Date(body.task_end + ":00.000Z"),
                fail_idx: failData.fail_idx,
                upper_task_idx: body.upper_task_idx ? +body.upper_task_idx : null,
                prj_idx: body.prj_idx
            }

            const result = await this.prisma.task.update({
                where: { task_idx: task_idx },
                data
            })

            const detailTask = await this.detail(task_idx);

            return ({
                status: 201,
                message: '수정되었습니다.',
                data: detailTask.data
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "수정하는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async deleteTask(task_idx: number): Promise<any> {
        try {
            const result = await this.prisma.task.delete({
                where: { task_idx: task_idx }
            });

            return ({
                status: 201,
                message: '삭제 되었습니다.',
                data: result
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "삭제하는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async mainTaskList(prj_idx: number): Promise<any> {
        try {
            const result = await this.prisma.$queryRaw(
                `select`
                + this.selectQueryCommon + `,` + this.selectQueryDescDate + `,` + this.selectQueryDescInfo +
                `
                from
                    task T 
                where
                    prj_idx = ${prj_idx}
                AND UPPER_TASK_IDX IS NULL `
            );

            return ({
                status: 200,
                message: '메인할일 조회 되었습니다.',
                data: result
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "조회 하는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async subTasklist(upper_task_idx: number): Promise<any> {
        try {

            const result = await this.prisma.$queryRaw(
                `select`
                + this.selectQueryCommon + `,` + this.selectQueryDescDate + `,` + this.selectQueryDescInfo +
                `,M.mem_name as worker,
                    CONCAT('${process.env.CDN_URL}',MEM_PROFILE) as worker_SRC
                from
                    task T LEFT JOIN MEMBER M
                    ON T.reg_mem_idx = M.mem_idx
                where UPPER_TASK_IDX = ${upper_task_idx}
                order by task_end, 
                    (case
                        (task_important)
                        when 'O' then 0
                        when 'A' then 1
                        when 'B' then 2
                        when 'C' then 3
                    end)`
            );

            return ({
                status: 200,
                message: 'task list',
                data: result
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "리스트를 불러오는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async modifyMainTask(task_idx: number, body: TaskUpdateDTO): Promise<any> {
        try {

            //mainTask
            let data = await {
                task_title: body.task_title,
                task_memo: body.task_memo,
                task_start: new Date(body.task_start + ":00.000Z"),
                task_end: new Date(body.task_end + ":00.000Z"),
                reg_mem_idx: body.reg_mem_idx,
                task_important: null,
                task_state: null,
                project: { connect: { prj_idx: body.prj_idx } },
            }

            const result = await this.prisma.task.update({
                where: { task_idx: task_idx },
                data
            })

            const detailTask = await this.detail(task_idx);

            return ({
                status: 201,
                message: '수정되었습니다.',
                data: detailTask.data
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "수정하는데 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }
}
