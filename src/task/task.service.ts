import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { fail_reason, Prisma } from '@prisma/client';
import { SubTaskCreateDTO } from 'src/dto/subTask-create.dto';
import { TaskCreateDTO } from 'src/dto/task-create.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskService {
    constructor(private readonly prisma: PrismaService) { }

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
                task_start: new Date(body.task_start),
                task_end: new Date(body.task_end),
                reg_mem_idx: body.reg_mem_idx,
                task_important: null,
                task_state: null,
                project: { connect: { prj_idx: body.prj_idx } },
            }

            //메인 테스크의 경우 서브테스크 들의 진행상태에 영향을 받으므로
            //서브테스크가 모두 완료 되었다면 > 완료로 변경
            //서브테스크에 진행중이 한개라도 있으면 >> 진행중으로 변경
            //서브테스크에 미처리,보류 가 있더라도 완료/진행중으로 나눔
            const result = await this.prisma.task.create({ data });
            return ({
                status: 200,
                message: '할 일이 생성 됬어요!',
                data: result
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "메인 할일 생성에 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async subRegister(body: SubTaskCreateDTO): Promise<any> {
        try {

            let failData: fail_reason = {
                fail_idx: body.fail_idx === '' ? null : +body.fail_idx,
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

            //subTask
            let data: Prisma.taskCreateInput = {
                ...body,
                task_start: new Date(body.task_start),
                task_end: new Date(body.task_end),
                fail_idx: failData.fail_idx
            }
            const result = await this.prisma.task.create({ data });
            return ({
                status: 200,
                message: '할 일이 생성 됬어요!',
                // data: result
            });

        } catch (error) {
            console.log(error);
            throw new HttpException(error['response'] ? error['response'] : "메인 할일 생성에 실패했습니다.", HttpStatus.BAD_REQUEST);
        }
    }

    async list(prj_idx: number): Promise<any> {
        try {

            const result = await this.prisma.task.findMany({
                where : {prj_idx : prj_idx},
                select : {
                    task_idx : true,       
                    task_title : true,     
                    task_memo : true,      
                    task_start : true,     
                    task_end : true,       
                    upper_task_idx : true, 
                    reg_date : true,       
                    reg_mem_idx : true,    
                    upt_date : true,       
                    upt_mem_idx : true,    
                    task_important : true, 
                    task_state : true,     
                    fail_idx : true,       
                    prj_idx : true, 
                }
            });

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
}
