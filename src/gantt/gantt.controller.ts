import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { GanttService } from './gantt.service';

@Controller('gantt')
export class GanttController {
    constructor(private readonly ganttService: GanttService) { }

    @Get('list/:mem_idx')
    getFailReason(@Param('mem_idx', ParseIntPipe)mem_idx: number): Promise<object> {
        const result = this.ganttService.ganttTaskList(mem_idx);
        return result;
    }
}
