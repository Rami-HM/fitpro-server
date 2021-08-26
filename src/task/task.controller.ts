import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post } from '@nestjs/common';
import { task } from '@prisma/client';
import { SubTaskCreateDTO } from 'src/dto/subTask-create.dto';
import { SubTaskUpdateDTO } from 'src/dto/subTask-update.dto';
import { TaskCreateDTO } from 'src/dto/task-create.dto';
import { TaskUpdateDTO } from 'src/dto/task-update.dto';
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

    @Post('sub/modify/:task_idx')
    modifySubTask(@Param('task_idx',ParseIntPipe) task_idx: number, @Body() body: SubTaskUpdateDTO): Promise<any> {
        const result = this.taskService.modifySubTask(task_idx,body);
        return result;
    }

    @Get('project/list/:prj_idx')
    getTaskProjectList(@Param('prj_idx',ParseIntPipe) prj_idx: number): Promise<any> {
        const result = this.taskService.projectTasklist(prj_idx);
        return result;
    }

    @Get('detail/:task_idx')
    getTaskDetail(@Param('task_idx',ParseIntPipe) task_idx: number): Promise<any> {
        const result = this.taskService.detail(task_idx);
        return result;
    }

    @Get('list/:mem_idx/:tap_index')
    getMyTaskList(@Param('mem_idx',ParseIntPipe) mem_idx: number, @Param('tap_index',ParseIntPipe) tap_index: number): Promise<any> {
        const result = this.taskService.mylist(mem_idx,tap_index);
        return result;
    }

    @Patch('modify/state/:task_idx')
    modifyTaskState(@Body() body : task, @Param('task_idx',ParseIntPipe) task_idx: number): Promise<any> {
        const result = this.taskService.modifyTaskState(task_idx,body);
        return result;
    }

    @Delete('delete/:task_idx')
    deleteTask(@Param('task_idx',ParseIntPipe) task_idx: number): Promise<any> {
        const result = this.taskService.deleteTask(task_idx);
        return result;
    }

    @Get('main/list/:prj_idx')
    getMainTaskList(@Param('prj_idx',ParseIntPipe) prj_idx: number): Promise<any> {
        const result = this.taskService.mainTaskList(prj_idx);
        return result;
    }

    @Get('sub/list/:upper_task_idx')
    getSubTasklist(@Param('upper_task_idx',ParseIntPipe) upper_task_idx: number): Promise<any> {
        const result = this.taskService.subTasklist(upper_task_idx);
        return result;
    }

    @Post('main/modify/:task_idx')
    modifyMainTask(@Param('task_idx',ParseIntPipe) task_idx: number, @Body() body: TaskUpdateDTO): Promise<any> {
        const result = this.taskService.modifyMainTask(task_idx,body);
        return result;
    }
}
