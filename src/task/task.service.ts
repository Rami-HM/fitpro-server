import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { TaskCreateDTO } from 'src/dto/task-create.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class TaskService {
    constructor(private readonly prisma: PrismaService) { }

    async register(body: TaskCreateDTO): Promise<any> {
        try {

            //메인 테스크의 경우 서브테스크 들의 진행상태에 영향을 받으므로
            //서브테스크가 모두 완료 되었다면 > 완료로 변경
            //서브테스크에 진행중이 한개라도 있으면 >> 진행중으로 변경
            //서브테스크에 미처리,보류 가 있더라도 완료/진행중으로 나눔
            const result = await this.prisma.task.create({
                data: {
                    task_title: body.task_title,
                    task_memo: body.task_memo,
                    task_start: new Date(body.task_start),
                    task_end: new Date(body.task_end),
                    reg_mem_idx: body.reg_mem_idx ,
                    task_important : '',
                    task_state : '',
                    project: { connect: { prj_idx : body.prj_idx } },
                }
            });
            console.log(body)
            console.log(result)
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
}
