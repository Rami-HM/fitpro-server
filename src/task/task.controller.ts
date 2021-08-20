import { Body, Controller, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { SubTaskCreateDTO } from 'src/dto/subTask-create.dto';
import { TaskCreateDTO } from 'src/dto/task-create.dto';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    @Post('insert')
    insertMainTask(@Body() body: TaskCreateDTO): Promise<any> {
        const result = this.taskService.register(body);
        return result;
    }

    @Post('sub/insert')
    insertSubTask(@Body() body: SubTaskCreateDTO): Promise<any> {
        const result = this.taskService.subRegister(body);
        return result;
    }

    @Get('list/:prj_idx')
    getTaskList(@Param('prj_idx',ParseIntPipe) prj_idx: number): Promise<any> {
        const result = this.taskService.list(prj_idx);
        return result;
    }
}
