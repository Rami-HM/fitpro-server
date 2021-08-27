import { Controller, Get, Param, ParseIntPipe, Query } from '@nestjs/common';
import { StatsService } from './stats.service';

@Controller('stats')
export class StatsController {
    constructor(private readonly statsService: StatsService) { }

    @Get('total/:prj_idx')
    totalStats(@Param('prj_idx',ParseIntPipe) prj_idx:number , @Query() query): Promise<any> {
        const result = this.statsService.total(prj_idx, query);
        return result;
    }

    @Get('total/task/:prj_idx')
    totalTaskStats(@Param('prj_idx',ParseIntPipe) prj_idx:number): Promise<any> {
        const result = this.statsService.totalTasknum(prj_idx);
        return result;
    }

    @Get('assign/:prj_idx')
    assignTaskStats(@Param('prj_idx',ParseIntPipe) prj_idx:number): Promise<any> {
        const result = this.statsService.assignStats(prj_idx);
        return result;
    }
}
