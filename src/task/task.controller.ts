import { Body, Controller, Post } from '@nestjs/common';
import { TaskCreateDTO } from 'src/dto/task-create.dto';
import { TaskService } from './task.service';

@Controller('task')
export class TaskController {
    constructor(private readonly taskService: TaskService) { }

    @Post('insert')
    insertMember(@Body() body: TaskCreateDTO): Promise<any> {
        const result = this.taskService.register(body);
        return result;
    }
}
