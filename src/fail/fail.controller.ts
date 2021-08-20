import { FailService } from './fail.service';
import { Controller, Get } from '@nestjs/common';

@Controller('fail')
export class FailController {

    constructor(private readonly failService:FailService){}

    @Get('reason')
    getFailReason() : Promise<object>{
      const result = this.failService.getFailReason();
      return result;
    }
}
