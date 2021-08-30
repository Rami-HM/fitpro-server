import { CalendarService } from './calendar.service';
import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';

@Controller('calendar')
export class CalendarController {
    constructor(private readonly calendarService: CalendarService) { }

    @Get('list/:prj_idx')
    calendarTasklist(@Param('prj_idx',ParseIntPipe) prj_idx:number): Promise<any> {
        const result = this.calendarService.calendarTasklist(prj_idx);
        return result;
    }
}
